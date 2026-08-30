import { baseApi } from './baseApi';

export const trashApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrash: builder.query({
      query: () => '/trash',
      providesTags: ['Trash'],
    }),
    restoreItem: builder.mutation({
      query: (data) => ({
        url: '/trash/restore',
        method: 'POST',
        body: data, // { resourceType, resourceId }
      }),
      invalidatesTags: ['Trash', 'Folder', 'File'],
    }),
    emptyTrash: builder.mutation({
      query: () => ({
        url: '/trash/empty',
        method: 'POST',
      }),
      invalidatesTags: ['Trash'],
    }),
  }),
});

export const {
  useGetTrashQuery,
  useRestoreItemMutation,
  useEmptyTrashMutation,
} = trashApi;
