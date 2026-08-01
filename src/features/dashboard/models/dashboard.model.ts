export interface DashboardPerson {
  id: string
  name: string
}

export interface DashboardProjectReference {
  id: string
  name: string
}

export interface DashboardProjectReview {
  id: string
  rank?: number
  project: DashboardProjectReference
  owner?: DashboardPerson | null
  rating: number
  comment?: string | null
  reviewedAt?: string | null
}

export interface DashboardCustomerSatisfaction {
  averageRating: number
  totalReviews: number
  reviews: DashboardProjectReview[]
  ranking: DashboardProjectReview[]
}
