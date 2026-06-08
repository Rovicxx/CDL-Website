// Daily Scripture Fetcher
(function() {
    const scriptureList = [
        '"Commit to the Lord whatever you do, and He will establish your plans." – Proverbs 16:3',
        '"The Lord is my light and my salvation—whom shall I fear?" – Psalm 27:1',
        '"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." – Colossians 3:23',
        '"Trust in the Lord with all your heart and lean not on your own understanding." – Proverbs 3:5',
        '"For God so loved the world that he gave his one and only Son." – John 3:16',
        '"I can do all things through Christ who strengthens me." – Philippians 4:13',
        '"The poor you will always have with you, therefore I command you to be openhanded." – Deuteronomy 15:11',
        '"Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows." – James 1:27',
        '"Blessed are the merciful, for they will be shown mercy." – Matthew 5:7',
        '"As for God, his way is perfect." – Psalm 18:30',
        '"He has shown you, O mortal, what is good. And what does the Lord require of you?" – Micah 6:8',
        '"Do to others as you would have them do to you." – Luke 6:31',
        '"Love one another deeply, from the heart." – 1 Peter 1:22',
        '"May the Lord answer you when you are in distress." – Psalm 20:1',
        '"For the love of money is a root of all kinds of evil." – 1 Timothy 6:10',
        '"Therefore, as Gods chosen people, holy and dearly loved, clothe yourselves with compassion." – Colossians 3:12',
        '"Give, and it will be given to you." – Luke 6:38',
        '"The Lord is close to the brokenhearted." – Psalm 34:18',
        '"Let us not love with words or speech but with actions and in truth." – 1 John 3:18',
        '"But seek first his kingdom and his righteousness, and all these things will be given to you as well." – Matthew 6:33',
        '"If any of you lacks wisdom, you should ask God." – James 1:5',
        '"Therefore each of you must put off falsehood and speak truthfully." – Ephesians 4:25',
        '"Peace I leave with you; my peace I give you." – John 14:27',
        '"The greatest of these is love." – 1 Corinthians 13:13',
        '"Rejoice in the Lord always. I will say it again: Rejoice!" – Philippians 4:4',
        '"So in everything, do to others what you would have them do to you." – Matthew 7:12',
        '"Bear one anothers burdens, and so fulfill the law of Christ." – Galatians 6:2',
        '"Let all that you do be done in love." – 1 Corinthians 16:14',
        '"I have come that they may have life, and have it to the full." – John 10:10',
        '"Blessed are those who hunger and thirst for righteousness." – Matthew 5:6'
    ];

    function getDailyScripture() {
        try {
            const cacheKey = 'cdl_daily_scripture_date';
            const today = new Date().toDateString();
            const cached = sessionStorage.getItem(cacheKey);
            const cachedDate = sessionStorage.getItem(cacheKey + '_date');

            if (cached && cachedDate === today) {
                return cached;
            }

            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            const index = dayOfYear % scriptureList.length;
            const scripture = scriptureList[index];

            sessionStorage.setItem(cacheKey, scripture);
            sessionStorage.setItem(cacheKey + '_date', today);

            return scripture;
        } catch (err) {
            console.error('Error fetching daily scripture:', err);
            return scriptureList[0];
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        const scriptureEl = document.getElementById('daily-scripture');
        if (scriptureEl) {
            scriptureEl.textContent = getDailyScripture();
        }
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const leftButton = document.getElementById('framework-scroll-left');
    const rightButton = document.getElementById('framework-scroll-right');
    const frameworkCards = document.getElementById('framework-cards');

    const addProgramBtn = document.getElementById('add-program-btn');
    const addProgramModal = document.getElementById('add-program-modal');
    const addModalClose = document.getElementById('add-modal-close');
    const addCancel = document.getElementById('add-cancel');
    const addProgramForm = document.getElementById('add-program-form');

    const programGalleryModal = document.getElementById('program-gallery-modal');
    const programGalleryTitle = document.getElementById('program-gallery-title');
    const programGallerySubtitle = document.getElementById('program-gallery-subtitle');
    const programGalleryImages = document.getElementById('program-gallery-images');
    const programGalleryClose = document.getElementById('program-gallery-close');

    // Use this relative API path on Vercel
    const API_BASE = '/api';

    const programImageMap = {
        'tabang-kapwa': {
            title: 'TABANG – KAPWA',
            subtitle: 'Works of Mercy',
            images: ['images/group.png', 'images/OIP.png', 'images/OIP-17.png']
        },
        'tabang-kabuhayan': {
            title: 'TABANG – KABUHAYAN',
            subtitle: 'Works of Development',
            images: ['images/OIP-17.png', 'images/group.png', 'images/OIP.png']
        },
        'tabang-katilingkasan': {
            title: 'TABANG – KATALINGKASAN',
            subtitle: 'Works of Justice',
            images: ['images/group.png', 'images/OIP.png', 'images/screenshot.png']
        },
        'tabang-katuwang': {
            title: 'TABANG – KATUWANG',
            subtitle: 'Volunteer Management',
            images: ['images/screenshot.png', 'images/OIP.png', 'images/OIP-17.png']
        }
    };

    function getGalleryDataFromCard(card) {
        const title = card.dataset.title || '';
        const subtitle = card.dataset.subtitle || '';
        const images = card.dataset.images ? card.dataset.images.split(';').map(src => src.trim()).filter(Boolean) : [];

        if (images.length > 0) {
            return { title: title || 'Program Images', subtitle, images };
        }

        const programKey = card.dataset.program;
        return programImageMap[programKey] || {
            title: title || 'Program Images',
            subtitle,
            images: ['images/group.png']
        };
    }

    function renderProgramGallery(card) {
        const program = getGalleryDataFromCard(card);

        if (programGalleryTitle) programGalleryTitle.textContent = program.title;
        if (programGallerySubtitle) programGallerySubtitle.textContent = program.subtitle;

        if (programGalleryImages) {
            programGalleryImages.innerHTML = program.images.map(src => `
                <div class="rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                    <img src="${src}" alt="${program.title} photo" class="w-full h-48 object-cover" />
                </div>
            `).join('');
        }
    }

    function openProgramGallery(card) {
        renderProgramGallery(card);
        if (programGalleryModal) {
            programGalleryModal.classList.remove('hidden');
            programGalleryModal.classList.add('flex');
        }
    }

    function closeProgramGallery() {
        if (programGalleryModal) {
            programGalleryModal.classList.add('hidden');
            programGalleryModal.classList.remove('flex');
        }
    }

    function attachGalleryCardListeners() {
        if (!frameworkCards) return;
        frameworkCards.querySelectorAll('article[data-program]').forEach(card => {
            card.addEventListener('click', () => openProgramGallery(card));
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProgramGallery(card);
                }
            });
        });
    }

    function getStoredPrograms() {
        try {
            return JSON.parse(localStorage.getItem('cdlPrograms') || '[]');
        } catch (err) {
            return [];
        }
    }

    function saveStoredPrograms(programs) {
        localStorage.setItem('cdlPrograms', JSON.stringify(programs));
    }

    function createProgramCard(program) {
        const article = document.createElement('article');
        article.className = 'snap-start shrink-0 w-[90vw] sm:w-[70vw] md:w-[46vw] lg:w-[24rem] xl:w-[26rem] bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-caritasCrimson shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer';
        const bulletsHtml = (program.items || []).map(i => `<li class="flex items-start space-x-2"><span class="text-caritasCrimson mt-0.5">•</span><span>${i}</span></li>`).join('');

        if (program.key) article.dataset.program = program.key;
        if (program.title) article.dataset.title = program.title;
        if (program.tag) article.dataset.subtitle = program.tag;
        if (program.images && Array.isArray(program.images)) {
            article.dataset.images = program.images.join(';');
        }

        article.innerHTML = `
            <div>
                <div class="mb-5 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">${program.pillar}</span>
                    <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-caritasCrimson group-hover:text-white transition duration-300"><img src="images/OIP.png" alt="icon"/></div>
                </div>
                <h3 class="font-heading font-extrabold text-xl text-deepCharcoal mb-1">${program.title}</h3>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">${program.tag}</p>
                <ul class="space-y-2.5 text-sm text-gray-600 mb-6">
                    ${bulletsHtml}
                </ul>
            </div>
            <div class="pt-4 border-t border-gray-100 mt-auto">
                <span class="text-xs font-medium text-gray-400 uppercase block mb-0.5">Strategic Focus</span>
                <span class="text-sm font-bold text-deepCharcoal">Goal: TBD</span>
            </div>
        `;

        article.addEventListener('click', () => openProgramGallery(article));
        article.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProgramGallery(article);
            }
        });

        return article;
    }

    function renderStoredPrograms() {
        const stored = getStoredPrograms();
        stored.forEach(program => {
            if (frameworkCards) frameworkCards.appendChild(createProgramCard(program));
        });
    }

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            const wasOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            menuButton.setAttribute('aria-expanded', String(!wasOpen));
        });
    }

    if (frameworkCards && leftButton && rightButton) {
        const card = frameworkCards.querySelector('article');
        const scrollAmount = card ? card.offsetWidth + 24 : 360;

        leftButton.addEventListener('click', function () {
            frameworkCards.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        rightButton.addEventListener('click', function () {
            frameworkCards.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    renderStoredPrograms();
    attachGalleryCardListeners();

    if (programGalleryClose) {
        programGalleryClose.addEventListener('click', closeProgramGallery);
    }
    if (programGalleryModal) {
        programGalleryModal.addEventListener('click', event => {
            if (event.target === programGalleryModal) {
                closeProgramGallery();
            }
        });
    }
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeProgramGallery();
            closeModal();
        }
    });

    // Modal controls
    function openModal() {
        if (addProgramModal) {
            addProgramModal.classList.remove('hidden');
            addProgramModal.classList.add('flex');
        }
    }

    function closeModal() {
        if (addProgramModal) {
            addProgramModal.classList.add('hidden');
            addProgramModal.classList.remove('flex');
        }
        if (addProgramForm) addProgramForm.reset();
    }

    if (addProgramBtn) addProgramBtn.addEventListener('click', openModal);
    if (addModalClose) addModalClose.addEventListener('click', closeModal);
    if (addCancel) addCancel.addEventListener('click', closeModal);

    // Handle add program submission
    if (addProgramForm && frameworkCards) {
        addProgramForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const password = document.getElementById('admin-password').value;
            const pillar = document.getElementById('program-pillar').value || 'Pillar';
            const title = document.getElementById('program-title').value || 'New Program';
            const tag = document.getElementById('program-tag').value || '';
            const itemsRaw = document.getElementById('program-items').value || '';
            const items = itemsRaw.split(',').map(s => s.trim()).filter(Boolean);

            try {
                const targetUrl = API_BASE && API_BASE.indexOf('REPLACE_WITH') === -1
                    ? API_BASE + '/programs'
                    : (location.protocol + '//' + location.hostname + ':3000') + '/api/programs';

                const res = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password, pillar, title, tag, items })
                });

                if (res.status === 401) {
                    alert('Invalid admin password.');
                    return;
                }
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert('Failed to add program: ' + (err.error || res.statusText));
                    return;
                }

                const program = await res.json();
                const article = createProgramCard(program);

                frameworkCards.appendChild(article);
                const stored = getStoredPrograms();
                stored.push(program);
                saveStoredPrograms(stored);
                closeModal();

                setTimeout(() => article.scrollIntoView({ behavior: 'smooth', inline: 'center' }), 100);

            } catch (err) {
                console.error(err);
                alert('Network error while adding program.');
            }
        });
    }
});