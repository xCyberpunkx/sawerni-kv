"use client"
export function WhereFindUsSection() {
 

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#2A3875] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto relative">
          {/* Map Container */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden p-8">
            {/* Map Image */}
            <div className="relative w-full h-full">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FINDUS-ERf0FWcKDkQQVm9jyIjOmKj5NWBQN3.png"
                alt="Algeria Map"
                className="w-full h-full object-contain"
              />
              </div>
          </div>
        </div>
      </div>
    </section>
  )
}
