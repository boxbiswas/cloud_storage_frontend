import { baseApi } from './baseApi';

export const shareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShares: builder.query({
      query: ({ resourceType, resourceId }) => `/shares/${resourceType}/${resourceId}`,
      transformResponse: (response) => response.shares,
      providesTags: (result, error, { resourceType, resourceId }) => [
        { type: 'Share', id: `${resourceType}-${resourceId}` }
      ],
    }),
    createShare: builder.mutation({
      query: (data) => ({
        url: '/shares',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { resourceType, resourceId }) => [
        { type: 'Share', id: `${resourceType}-${resourceId}` }
      ],
    }),
    deleteShare: builder.mutation({
      query: (shareId) => ({
        url: `/shares/${shareId}`,
        method: 'DELETE',
      }),
      // We don't have the resourceId in the args (only shareId).
      // A standard approach is to invalidate the whole 'Share' list, or return the resourceId from backend.
      // We'll invalidate all shares to be safe, or you could pass { shareId, resourceType, resourceId } as args.
      invalidatesTags: ['Share'],
    }),
    createLinkShare: builder.mutation({
      query: (data) => ({
        url: '/link-shares',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Share'],
    }),
    deleteLinkShare: builder.mutation({
      query: (linkId) => ({
        url: `/link-shares/${linkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Share'],
    }),
  }),
});

export const {
  useGetSharesQuery,
  useCreateShareMutation,
  useDeleteShareMutation,
  useCreateLinkShareMutation,
  useDeleteLinkShareMutation,
} = shareApi;
