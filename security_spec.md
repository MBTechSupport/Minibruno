# Security Specification - Mini Bruno Support Tickets

## 1. Data Invariants
1. A ticket must belong to an authenticated user (`request.auth != null`).
2. A ticket's `userId` must match the creator's `request.auth.uid`.
3. A ticket's `ticketCode` must follow the corporate pattern `#TK-YYYY-XXXX`.
4. Regular users can only read tickets where `userId == request.auth.uid`.
5. Authorized administrative emails (or admins) can read and manage all tickets.
6. The status of a ticket can only be 'Abierto', 'En revisión', or 'Resuelto'.

## 2. The Dirty Dozen Payloads (Negative Tests)
1. Unauthenticated ticket creation (`auth == null`).
2. Spoofed userId creation (`incoming().userId != request.auth.uid`).
3. Invalid status creation (`status: 'Hackeado'`).
4. Read arbitrary user's ticket without authorization.
5. Incomplete payload missing required fields (`missing ticketCode`).
6. Mass assignment of disallowed fields (`isAdmin: true`).
7. Update of immutable ticket fields (`userId` or `ticketCode` tampering).
8. Client claiming admin rights via unverified custom claims.
9. Malformed ticket code (`ticketCode: '123'`).
10. SQL/Script injection inside subject/description exceeding bounds.
11. Deletion of tickets by unprivileged users.
12. Status escalation without valid state machine transition.
