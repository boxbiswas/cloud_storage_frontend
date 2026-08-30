import { baseApi } from './baseApi';

export const folderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFolderContents: builder.query({
      query: (folderId) => {
        if (!folderId) return '/folders/root';
        return `/folders/${folderId}`;
      },
      providesTags: (result, error, id) => [{ type: 'Folder', id: id || 'root' }],
    }),
    createFolder: builder.mutation({
      query: (data) => ({
        url: '/folders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { parentId }) => [
        { type: 'Folder', id: parentId || 'root' }
      ],
    }),
    renameFolder: builder.mutation({
      query: ({ id, name }) => ({
        url: `/folders/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      async onQueryStarted({ id, name, parentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          folderApi.util.updateQueryData('getFolderContents', parentId || 'root', (draft) => {
            const arr = draft.folders || draft.children?.folders;
            if (arr) {
              const folder = arr.find(f => f.id === id);
              if (folder) folder.name = name;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { parentId }) => [
        { type: 'Folder', id: parentId || 'root' }
      ],
    }),
    deleteFolder: builder.mutation({
      query: (id) => ({
        url: `/folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, parentId }) => [
        { type: 'Folder', id },
        { type: 'Folder', id: parentId || 'root' }
      ],
    }),
    moveFolder: builder.mutation({
      query: ({ id, parentId }) => ({
        url: `/folders/${id}`,
        method: 'PATCH',
        body: { parentId },
      }),
      async onQueryStarted({ id, parentId, oldParentId, item }, { dispatch, queryFulfilled }) {
        // Optimistically remove from source
        const patchSource = dispatch(
          folderApi.util.updateQueryData('getFolderContents', oldParentId || 'root', (draft) => {
            const arr = draft.folders || draft.children?.folders;
            if (arr) {
              const idx = arr.findIndex(f => f.id === id);
              if (idx !== -1) arr.splice(idx, 1);
            }
          })
        );
        // Optimistically add to destination
        const patchDest = dispatch(
          folderApi.util.updateQueryData('getFolderContents', parentId || 'root', (draft) => {
            const arr = draft.folders || draft.children?.folders;
            if (arr && item) {
              arr.unshift({ ...item, parentId });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchSource.undo();
          patchDest.undo();
        }
      },
      invalidatesTags: (result, error, { parentId, oldParentId }) => [
        { type: 'Folder', id: oldParentId || 'root' },
        { type: 'Folder', id: parentId || 'root' }
      ],
    }),
  }),
});

export const {
  useGetFolderContentsQuery,
  useCreateFolderMutation,
  useRenameFolderMutation,
  useDeleteFolderMutation,
  useMoveFolderMutation,
} = folderApi;
