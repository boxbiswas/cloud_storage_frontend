import { baseApi } from './baseApi';

export const starApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addStar: builder.mutation({
      query: (data) => ({
        url: '/stars',
        method: 'POST',
        body: data, // { resourceType, resourceId }
      }),
      // Invalidate the Search query cache so the Starred page refreshes
      // We also invalidate Folder/File to update individual icons if they depend on cache
      invalidatesTags: ['Search', 'Folder', 'File'],
    }),
    removeStar: builder.mutation({
      query: (data) => ({
        url: '/stars',
        method: 'DELETE',
        body: data, // { resourceType, resourceId }
      }),
      invalidatesTags: ['Search', 'Folder', 'File'],
    }),
  }),
});

export const {
  useAddStarMutation,
  useRemoveStarMutation,
} = starApi;
