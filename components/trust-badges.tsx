import { Shield, Heart, Lock, Award, CheckCircle, Star } from 'lucide-react'

export function TrustBadges() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>100% Kid-Safe</span>
            </div>
            <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>1 Free Story</span>
            </div>
            <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <span>Secure Payment</span>
            </div>
        </div>
    )
}

export function SafetyBadge() {
    return (
        <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-full px-4 py-2 shadow-md">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-bold text-green-800">Child-Safety Certified</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
    )
}

export function NoCreditCardBadge() {
    return (
        <div className="inline-flex items-center gap-2 bg-blue-50 border-2 border-blue-300 rounded-full px-4 py-2 shadow-md">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-blue-800">No Credit Card Required</span>
        </div>
    )
}

export function MoneyBackBadge() {
    return (
        <div className="inline-flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 rounded-full px-4 py-2 shadow-md">
            <Star className="h-5 w-5 text-yellow-600 fill-yellow-400" />
            <span className="font-bold text-yellow-800">30-Day Money-Back Guarantee</span>
        </div>
    )
}

export function AdFreeBadge() {
    return (
        <div className="inline-flex items-center gap-2 bg-purple-50 border-2 border-purple-300 rounded-full px-4 py-2 shadow-md">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-purple-800">100% Ad-Free</span>
        </div>
    )
}
