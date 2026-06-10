// HF-Antenna-Designer/ui/renderer/sections.js
// Tailwind + HeadlessUI collapsible section generator (Amber/Orange theme)

export function createSection(title, innerHTML) {
    const id = "sec_" + Math.random().toString(36).substring(2, 10);

    return `
    <div class="w-full my-4">
        <div class="border border-amber-300 rounded-xl shadow-sm bg-white">
            <button 
                class="w-full flex justify-between items-center px-4 py-3 text-left 
                       text-amber-700 font-semibold text-lg
                       hover:bg-amber-50 transition-colors"
                onclick="document.getElementById('${id}').classList.toggle('hidden');
                         this.querySelector('.chevron').classList.toggle('rotate-180');"
            >
                <span>${title}</span>
                <svg class="chevron h-5 w-5 text-amber-600 transition-transform duration-300"
                     fill="none" stroke="currentColor" stroke-width="2"
                     viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div id="${id}" class="px-4 pb-4 hidden">
                ${innerHTML}
            </div>
        </div>
    </div>
    `;
}
