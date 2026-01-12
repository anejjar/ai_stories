// @ts-nocheck - Legacy file, not used in current application
// Firestore Data Models

import { Timestamp } from 'firebase/firestore'
import type { User, Story, TrialUsage, Payment, SubscriptionTier } from './index'

// Firestore User Document
export interface FirestoreUser {
  email: string
  displayName?: string
  photoURL?: string
  subscriptionTier: SubscriptionTier
  createdAt: Timestamp
  updatedAt: Timestamp
  lemonsqueezyCustomerId?: string
  lemonsqueezySubscriptionId?: string
}

// Firestore Story Document
export interface FirestoreStory {
  userId: string
  title: string
  content: string
  childName: string
  adjectives: string[]
  theme: string
  moral?: string
  hasImages: boolean
  imageUrls?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Firestore Trial Usage Document
export interface FirestoreTrialUsage {
  userId: string
  storiesGenerated: number
  trialCompleted: boolean
  trialCompletedAt?: Timestamp
}

// Firestore Payment Document
export interface FirestorePayment {
  userId: string
  lemonsqueezyOrderId: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  subscriptionTier: SubscriptionTier
  createdAt: Timestamp
}

// Helper functions to convert between Firestore and app types
export function firestoreUserToUser(id: string, data: FirestoreUser): User {
  return {
    id,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    subscriptionTier: data.subscriptionTier,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    lemonsqueezyCustomerId: data.lemonsqueezyCustomerId,
    lemonsqueezySubscriptionId: data.lemonsqueezySubscriptionId,
  }
}

export function userToFirestoreUser(user: Partial<User>): Partial<FirestoreUser> {
  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    subscriptionTier: user.subscriptionTier,
    lemonsqueezyCustomerId: user.lemonsqueezyCustomerId,
    lemonsqueezySubscriptionId: user.lemonsqueezySubscriptionId,
  } as Partial<FirestoreUser>
}

export function firestoreStoryToStory(id: string, data: FirestoreStory): Story {
  return {
    id,
    userId: data.userId,
    title: data.title,
    content: data.content,
    childName: data.childName,
    adjectives: data.adjectives,
    theme: data.theme,
    moral: data.moral,
    hasImages: data.hasImages,
    imageUrls: data.imageUrls,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export function storyToFirestoreStory(story: Partial<Story>): Partial<FirestoreStory> {
  return {
    userId: story.userId,
    title: story.title,
    content: story.content,
    childName: story.childName,
    adjectives: story.adjectives,
    theme: story.theme,
    moral: story.moral,
    hasImages: story.hasImages,
    imageUrls: story.imageUrls,
  } as Partial<FirestoreStory>
}

