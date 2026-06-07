# Role System Implementation Plan

## สิ่งที่จะเพิ่ม:

### 1. Schema Changes
- เพิ่ม `role` field ใน `WorkspaceMember` (ADMIN | MEMBER | VIEWER)
- `User.role = ADMIN` → Super Admin เห็นทุก Workspace

### 2. Logic Changes
- `getUserWorkspaces()` → ถ้า User.role = ADMIN → return ทุก Workspace
- `getActiveWorkspaceContext()` → ADMIN เข้าถึงได้ทุก workspace
- Middleware/Guard → check role ก่อน action สำคัญ

### 3. UI Changes  
- Badge แสดง role ใน Workspace Switcher
- หน้า Workspaces แสดง role ของ member
