# Restoration & Fix Guide

## ✅ Status Update
I have successfully restored your database and inferred the schema from your existing code.

1.  **Database Schema**: Restored using valid migration files found in `server/migrations`.
2.  **Data Seeding**: Created and executed `server/scripts/seed.ts`.
    - **Admin User Created**: `admin@cosmodecor.pk` / `admin`
    - **Sample Data**: Added categories (Living Room, etc.) and products.
3.  **Backend**: Running and verified.

## 🛠 Fix for 404 Errors (Login/Register/Admin)
The 404 errors are likely due to a stale Next.js build cache after moving the project files. The routes `app/(store)/login` and `app/admin` exist in your code.

### Step-by-Step Fix:

1.  **Stop the running server** (Ctrl+C in terminal).
2.  **Clear the build cache** by running this command in your VS Code terminal:
    ```powershell
    Remove-Item -Recurse -Force .next
    ```
    *(If that fails, manually delete the `.next` folder in `D:\cosmodecor`)*
3.  **Restart the server**:
    ```powershell
    npm run dev
    ```
    *Wait for "Ready on http://localhost:3000" to appear.*

4.  **Access the Admin Panel**:
    - Go to: `http://localhost:3000/login`
    - Email: `admin@cosmodecor.pk`
    - Password: `admin`
    - You will be redirected to the Admin Dashboard.

## 🔄 How to Reset Database (If needed later)
If you ever want to reset the database to this clean state again:

1.  **Reset Schema**:
    ```powershell
    cmd /c "npm run db:migrate"
    ```
2.  **Seed Data**:
    ```powershell
    cmd /c "npx ts-node server/scripts/seed.ts"
    ```

## 📂 Project Structure Notes
- **Frontend**: Serves at `http://localhost:3000`.
- **Backend API**: Serves at `http://localhost:5000` (Proxied from frontend).
- **Admin**: Located at `/admin` (Protected, requires login).
