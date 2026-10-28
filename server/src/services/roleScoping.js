// Role-based scoping engine for CatchTrace
export function filterBatchesByRole(batches, user) {
  if (!user || user.role === 'ADMIN') return batches;

  const userName = (user.name || '').toLowerCase().trim();
  const userOrg = (user.org || '').toLowerCase().trim();
  const userEmail = (user.email || '').toLowerCase().trim();
  const userId = (user.id || '').toLowerCase().trim();

  if (user.role === 'FISHER') {
    return batches.filter((b) => {
      // 1. Direct user identifier or email match
      if (b.user_id && userId && b.user_id.toLowerCase() === userId) return true;
      if (b.user_email && userEmail && b.user_email.toLowerCase() === userEmail) return true;

      // 2. Operator name exact or partial match
      if (b.operator_name && userName && (
        b.operator_name.toLowerCase().trim() === userName ||
        userName.includes(b.operator_name.toLowerCase().trim()) ||
        b.operator_name.toLowerCase().trim().includes(userName)
      )) return true;

      // 3. Initial Landing event actor match
      const matchLanding = (b.events || []).some(
        (e) =>
          e.event_type === 'LANDING' &&
          e.actor_name &&
          userName &&
          (e.actor_name.toLowerCase().includes(userName) || userName.includes(e.actor_name.toLowerCase()))
      );
      if (matchLanding) return true;

      return false;
    });
  }

  if (user.role === 'TRADER') {
    return batches.filter((b) => {
      const matchPurchase = (b.events || []).some(
        (e) =>
          e.event_type === 'PURCHASE' &&
          ((e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
           (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
      const matchHandler = b.current_handler && userOrg && (
        b.current_handler.toLowerCase().includes(userOrg) || userOrg.includes(b.current_handler.toLowerCase())
      );
      return matchPurchase || matchHandler;
    });
  }

  if (user.role === 'PROCESSOR') {
    return batches.filter((b) => {
      const matchProcessing = (b.events || []).some(
        (e) =>
          e.event_type === 'PROCESSING' &&
          ((e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
           (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
      const matchHandler = b.current_handler && userOrg && (
        b.current_handler.toLowerCase().includes(userOrg) || userOrg.includes(b.current_handler.toLowerCase())
      );
      return matchProcessing || matchHandler;
    });
  }

  if (user.role === 'TRANSPORTER') {
    return batches.filter((b) => {
      return (b.events || []).some(
        (e) =>
          e.event_type && e.event_type.startsWith('TRANSPORT') &&
          ((e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
           (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
    });
  }

  if (user.role === 'SELLER') {
    return batches.filter((b) => {
      const matchSale = (b.events || []).some(
        (e) =>
          e.event_type === 'SALE' &&
          ((e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
           (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
      const matchHandler = b.current_handler && userOrg && (
        b.current_handler.toLowerCase().includes(userOrg) || userOrg.includes(b.current_handler.toLowerCase())
      );
      return matchSale || matchHandler;
    });
  }

  return [];
}
