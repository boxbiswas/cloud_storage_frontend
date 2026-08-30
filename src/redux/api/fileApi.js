import { baseApi } from './baseApi';

export const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: '/files/upload',
        method: 'POST',
        body: formData,
        // Let the browser set the boundary for multipart/form-data
        formData: true,
      }),
      invalidatesTags: (result, error, arg) => {
        const folderId = arg.get('folderId');
        return [{ type: 'Folder', id: folderId || 'root' }];
      },
    }),
    renameFile: builder.mutation({
      query: ({ id, name }) => ({
        url: `/files/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      async onQueryStarted({ id, name, parentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          baseApi.util.updateQueryData('getFolderContents', parentId || 'root', (draft) => {
            const arr = draft.files || draft.children?.files;
            if (arr) {
              const file = arr.find(f => f.id === id);
              if (file) file.name = name;
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
    deleteFile: builder.mutation({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { parentId }) => [
        { type: 'Folder', id: parentId || 'root' }
      ],
    }),
    moveFile: builder.mutation({
      query: ({ id, folderId }) => ({
        url: `/files/${id}`,
        method: 'PATCH',
        body: { folderId },
      }),
      async onQueryStarted({ id, folderId, oldParentId, item }, { dispatch, queryFulfilled }) {
        // Optimistically remove from source
        const patchSource = dispatch(
          baseApi.util.updateQueryData('getFolderContents', oldParentId || 'root', (draft) => {
            const arr = draft.files || draft.children?.files;
            if (arr) {
              const idx = arr.findIndex(f => f.id === id);
              if (idx !== -1) arr.splice(idx, 1);
            }
          })
        );
        // Optimistically add to destination
        const patchDest = dispatch(
          baseApi.util.updateQueryData('getFolderContents', folderId || 'root', (draft) => {
            const arr = draft.files || draft.children?.files;
            if (arr && item) {
              arr.unshift({ ...item, folderId });
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
      invalidatesTags: (result, error, { oldParentId, folderId }) => [
        { type: 'Folder', id: oldParentId || 'root' },
        { type: 'Folder', id: folderId || 'root' }
      ],
    }),
    getDownloadUrl: builder.mutation({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useRenameFileMutation,
  useDeleteFileMutation,
  useMoveFileMutation,
  useGetDownloadUrlMutation,
} = fileApi;
