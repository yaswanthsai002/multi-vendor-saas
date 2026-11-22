export type ReviewPage = {
  items: {
    reviewId: string;
    authorName: string;
    authorAvatarUrl: string | null;
    rating: number;
    reviewText: string | null;
    createdAt: string;
  }[];
  pagination: { page: number; totalPages: number; hasMore: boolean };
  averageRating: number | null;
  ratingCount: number;
  distribution: { rating: number; count: number }[];
};
