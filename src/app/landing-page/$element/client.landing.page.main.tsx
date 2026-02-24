"use client"

import { CE_LandingPageLoginForm } from "./client.landing.page.login.form"

export default function CE_LandingPage() {
    return (
        <div className="min-h-screen w-full grid md:grid-cols-2 bg-white">
            <div className="hidden md:flex flex-col justify-between bg-[#3B7DDD] text-white p-16">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>Biller Core</span>
                </div>

                <div className="max-w-xl space-y-6">
                    <h1 className="text-5xl leading-tight font-light">
                        One integrated API
                        <br />
                        platform for your business needs
                    </h1>
                    <p className="text-lg text-white/90">
                        Enable seamless transactions and real-time data integration through BRI APIs.
                    </p>
                </div>

                <div />
            </div>
            <div className="flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md">
                    <div className="flex justify-end gap-8 text-sm text-blue-600 mb-16">
                        <a href="#" className="hover:underline">API Specification</a>
                        <a href="#" className="hover:underline">How to Connect</a>
                    </div>

                    <h2 className="text-4xl font-light text-[#3B7DDD] leading-tight mb-12">
                        Manage your API integrations and transactions
                    </h2>

                    <CE_LandingPageLoginForm />
                </div>
            </div>
        </div>
    )
}