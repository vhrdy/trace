import React from 'react'

export default function footer() {
  return (
   <footer className="border-t border-muted bg-muted/30">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
       <div className="flex items-center gap-2">
         <span className="text-xl font-bold text-foreground">trace.</span>
       </div>
       <p className="text-sm text-muted-foreground">
         Built with ❤️ for degens who made it
       </p>
     </div>
   </div>
 </footer>
  )
}
