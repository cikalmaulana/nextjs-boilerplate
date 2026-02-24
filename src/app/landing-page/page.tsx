"use server"

import CE_LandingPage from "./$element/client.landing.page.main"

export default async function LandingPage(){
    return (
        <div className="min-h-screen flex items-center justify-center">
            <CE_LandingPage />
        </div>
    )
}