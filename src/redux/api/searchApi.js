import { baseApi } from './baseApi';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchResources: builder.query({
      query: (params) => ({
        url: '/search',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Omit the cursor from the cache key to accumulate pages under the same search params
        const { cursor, ...rest } = queryArgs;
        return `${endpointName}(${JSON.stringify(rest)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.cursor) {
          // It's a fresh search/filter, replace the cache
          return newItems;
        }
        // It's a pagination request, append to the existing cache
        if (newItems.data?.folders) {
          currentCache.data.folders.push(...newItems.data.folders);
        }
        if (newItems.data?.files) {
          currentCache.data.files.push(...newItems.data.files);
        }
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
      providesTags: ['Search'],
    }),
  }),
});

export const {
  useSearchResourcesQuery,
} = searchApi;
