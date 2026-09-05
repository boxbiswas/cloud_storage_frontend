# ☁️ CloudVault — Frontend

> A premium, feature-rich cloud storage web application — the React frontend for CloudVault. Built with **React 19**, **Vite**, **Redux Toolkit (RTK Query)**, and **Tailwind CSS v4**.

<div align="center">

### 🚀 [**Live App → cloud-storage-frontend-phi.vercel.app**](https://cloud-storage-frontend-phi.vercel.app)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [State Management](#-state-management)
- [Pages & Routes](#-pages--routes)
- [Key Components](#-key-components)
- [Deployment](#-deployment)

---

## 🔍 Overview

CloudVault's frontend is a single-page application (SPA) that provides a Google Drive-inspired file management experience. It communicates with the backend REST API over HTTPS using **httpOnly cookie authentication** and handles all state management through **Redux Toolkit Query**, which provides automatic caching, background re-fetching, and optimistic cache updates for instant UI feedback.

---

## ✨ Features

- **🔐 Authentication** — Email/password login + Google One Tap Sign-In, with persistent sessions via httpOnly cookies
- **📁 File Browser (My Drive)** — Navigate a hierarchical folder tree with grid and list view modes
- **⬆️ File Upload** — Drag-and-drop upload zone with a real-time upload progress tray (multi-file support, up to 50MB per file)
- **👁️ File Preview** — In-browser preview for images, PDFs, plain text, and DOCX files
- **⬇️ File Download** — Direct programmatic downloads using Supabase signed URLs
- **🔗 Sharing** — Share any file or folder with another registered user (Viewer or Editor role)
- **🌐 Public Links** — Generate password-protected, expiry-aware public links; dedicated standalone view for link recipients
- **⭐ Starred** — Star/unstar any file or folder for quick access from the Starred page
- **🔍 Full-text Search** — Search across owned and shared items with filters for type, owner, starred, and date
- **🕒 Recent Files** — View your most recently accessed or uploaded files
- **👥 Shared With Me** — See all files and folders shared with you by other users
- **🗑️ Trash** — Soft-delete items with restore or permanent delete options
- **📱 Responsive Design** — Glassmorphism UI with smooth animations and micro-interactions
- **🔔 Toast Notifications** — Real-time feedback for all operations via `react-hot-toast`
- **♻️ Optimistic Updates** — UI updates immediately for move, rename, delete, and star actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| Icons | Lucide React |
| State & Data Fetching | Redux Toolkit (RTK Query) |
| Routing | React Router DOM v7 |
| Toast Notifications | react-hot-toast |
| File Drag & Drop | react-dropzone |
| HTTP Client | Axios (for direct Supabase uploads) |
| Deployment | Vercel |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- The [CloudVault Backend](https://github.com/boxbiswas/cloud_storage_backend) running locally or deployed

### Installation

```bash
# Clone the repository
git clone https://github.com/boxbiswas/cloud_storage_frontend.git
cd cloud_storage_frontend

# Install dependencies
npm install
```

### Setup

Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

Then fill in your backend URL. For local development:

```
VITE_API_URL=http://localhost:3000
```

### Run the Development Server

```bash
npm run dev
```

App available at: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
frontend/src/
│
├── App.jsx                   # Router setup, route definitions, global Toaster
├── main.jsx                  # React root, Redux Provider, BrowserRouter
│
├── pages/
│   ├── Login.jsx             # Login page wrapper
│   ├── Register.jsx          # Register page wrapper
│   ├── AuthCallback.jsx      # Google OAuth redirect handler
│   ├── Drive.jsx             # My Drive — main file browser (folders + files)
│   ├── Starred.jsx           # Starred files and folders
│   ├── Recent.jsx            # Recently accessed/uploaded files
│   ├── Shared.jsx            # Files/folders shared with the current user
│   ├── Trash.jsx             # Trashed items with restore/delete actions
│   ├── Search.jsx            # Full-text search with advanced filters
│   └── PublicLinkView.jsx    # Standalone public link viewer (no auth required)
│
├── components/
│   ├── ProtectedRoutes.jsx   # Auth gate — redirects to /login if not authenticated
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx     # Email/password form + Google One Tap button
│   │   └── RegisterForm.jsx  # Registration form
│   │
│   ├── layout/
│   │   └── Sidebar.jsx       # Navigation sidebar (nav links, storage gauge, user info, logout)
│   │
│   ├── drive/
│   │   ├── FileCard.jsx      # Grid view card for a single file
│   │   ├── FolderCard.jsx    # Grid view card for a single folder
│   │   ├── FileRow.jsx       # List view row for a single file
│   │   ├── FolderRow.jsx     # List view row for a single folder
│   │   ├── ContextMenu.jsx   # Right-click context menu with action items
│   │   ├── BreadcrumbBar.jsx # Navigation breadcrumb trail
│   │   ├── RenameModal.jsx   # Inline rename dialog
│   │   ├── MoveModal.jsx     # Folder picker for move actions
│   │   ├── SkeletonGrid.jsx  # Loading placeholder skeleton
│   │   └── FilePreviewModal.jsx # In-browser file preview (image, PDF, text, DOCX)
│   │
│   ├── upload/
│   │   ├── UploadDropzone.jsx# Drag-and-drop upload zone (react-dropzone)
│   │   ├── UploadTray.jsx    # Persistent upload progress tray (bottom of screen)
│   │   └── UploadItem.jsx    # Individual file upload progress row
│   │
│   ├── sharing/
│   │   ├── ShareModal.jsx    # Share with user by email (Viewer/Editor role selector)
│   │   ├── SharedUsersList.jsx # List of people with access + revoke button
│   │   ├── PermissionSelector.jsx # Dropdown for VIEWER / EDITOR role
│   │   └── PublicLinkModal.jsx # Generate public link (with optional password + expiry)
│   │
│   ├── search/
│   │   └── SearchBar.jsx     # Search input with filter panel toggle
│   │
│   └── common/
│       └── (shared utility components)
│
├── redux/
│   ├── store.js              # Redux store (auth, upload, drive slices + RTK Query)
│   │
│   ├── slices/
│   │   ├── authSlice.js      # User auth state (user object, setCredentials, logout)
│   │   ├── driveSlice.js     # Drive UI state (currentFolderId, viewMode, sortBy, selection)
│   │   └── uploadSlice.js    # Upload queue state (progress, status per file)
│   │
│   └── api/
│       ├── baseApi.js        # RTK Query base with 401 interceptor (auto-logout)
│       ├── authApi.js        # checkAuth, login, logout, register endpoints
│       ├── folderApi.js      # getFolderContents, createFolder, renameFolder, deleteFolder, moveFolder
│       ├── fileApi.js        # getDownloadUrl, renameFile, deleteFile, moveFile, restoreFile
│       ├── shareApi.js       # getShares, createShare, deleteShare, createLinkShare, getPublicLinkDetails
│       ├── searchApi.js      # searchResources
│       ├── starApi.js        # addStar, removeStar
│       └── trashApi.js       # getTrash, restoreTrashItem, permanentlyDelete
│
└── services/
    └── uploadService.js      # 2-step upload orchestration (init → PUT to Supabase → complete)
```

---

## 🧠 State Management

CloudVault uses a hybrid state management approach:

### RTK Query (Server State)
All server data is managed by RTK Query endpoints defined in `redux/api/`. This provides:
- **Automatic caching** — data is cached by tags (`Folder`, `File`, `Share`, `Star`, etc.)
- **Cache invalidation** — mutations automatically invalidate related queries
- **Optimistic updates** — mutations like `moveFile` and `renameFolder` instantly update the cache before the server confirms
- **Background re-fetching** — data stays fresh automatically

### Redux Slices (Local UI State)

| Slice | Manages |
|---|---|
| `authSlice` | The currently logged-in user object. Cleared on logout. |
| `driveSlice` | Current folder ID, view mode (grid/list), sort preferences, selected item IDs, context menu state. Resets on logout via `extraReducers`. |
| `uploadSlice` | The queue of in-progress file uploads with per-file progress percentages. |

### 401 Auto-Logout
`baseApi.js` wraps every RTK Query request. If any API response returns a `401 Unauthorized`, it automatically dispatches `logout()` and redirects to `/login`. Public link endpoints (`/link/*`) are excluded from this behavior.

---

## 🗺️ Pages & Routes

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | `Login` | ❌ | Email/password + Google sign-in |
| `/register` | `Register` | ❌ | Create a new account |
| `/auth/callback` | `AuthCallback` | ❌ | Google OAuth redirect handler |
| `/share/:token` | `PublicLinkView` | ❌ | Standalone public link viewer |
| `/` | `Drive` | ✅ | My Drive — main file browser |
| `/starred` | `Starred` | ✅ | Starred items |
| `/recent` | `Recent` | ✅ | Recent files |
| `/shared` | `Shared` | ✅ | Shared with me |
| `/trash` | `Trash` | ✅ | Trash bin |
| `/search` | `Search` | ✅ | Search results |

Protected routes are wrapped in `<ProtectedRoute>` which calls `GET /auth/me` to verify the session. Unauthenticated users are redirected to `/login`.

---

## 🔑 Key Components

### `Drive.jsx`
The main application view. Manages:
- RTK Query data fetching via `useGetFolderContentsQuery(currentFolderId)`
- All file/folder mutations (rename, delete, move, star, share, download, preview)
- Drag-and-drop upload via `UploadDropzone`
- Context menu and selection state via Redux
- Breadcrumb navigation
- Grid/list view toggle

### `UploadDropzone.jsx` + `uploadService.js`
Implements the 2-step Supabase upload flow:
1. `POST /files/init` → backend creates a DB record and returns a Supabase signed URL
2. `PUT {signedUrl}` → file is uploaded directly from the browser to Supabase CDN (no backend proxy)
3. `POST /files/complete` → backend verifies the file exists and marks it `READY`

### `PublicLinkView.jsx`
A completely standalone page (no sidebar, no auth) for recipients of public links. Handles:
- Loading state, error state, and password-protected links
- For **files**: displays name, size, and a download button
- For **folders**: displays a list of the folder's contents

---

## 🚀 Deployment (Vercel)

The frontend is deployed at **[https://cloud-storage-frontend-phi.vercel.app](https://cloud-storage-frontend-phi.vercel.app)**.

Push to the `main` branch — Vercel auto-deploys.

The `vercel.json` rewrite rule ensures React Router's client-side routing works correctly:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 📝 Notes

- **File Size Limit:** 50MB per file (enforced by the backend Zod schema).
- **Supported File Types:** JPEG, PNG, GIF, WebP (images), PDF, plain text, DOCX, XLSX.
- **Trash Retention:** Items in trash are permanently purged from both the database and Supabase Storage after **30 days**.

---

Made with ❤️ by [Indrasish Biswas](https://github.com/boxbiswas)
