import React from 'react'

const MainPageSection = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="container mx-auto min-h-screen">{children}</div>

    )
}

export default MainPageSection