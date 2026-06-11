// IMPORTANT: Replace with your Supabase project URL and anon key.
// You can find these in your Supabase project's API settings.
const SUPABASE_URL = "https://gsrpmelkrkdiqjptoeoc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcnBtZWxrcmtkaXFqcHRvZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDg1NjcsImV4cCI6MjA5NjU4NDU2N30.8wSb4Fb3jGP1lQVXsm5VvFcK_RRmQhbQR6YbaxvoLCM";

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

    const addActivityBtn = document.getElementById('add-activity-btn');
    const addActivityModal = document.getElementById('add-activity-modal');
    const addActivityModalClose = document.getElementById('add-activity-modal-close');
    const addActivityCancel = document.getElementById('add-activity-cancel');
    const addActivityForm = document.getElementById('add-activity-form');

    const programGalleryModal = document.getElementById('program-gallery-modal');
    const programGalleryTitle = document.getElementById('program-gallery-title');
    const programGallerySubtitle = document.getElementById('program-gallery-subtitle');
    const programGalleryImages = document.getElementById('program-gallery-images');
    const programGalleryClose = document.getElementById('program-gallery-close');

    const activityDetailModal = document.getElementById('activity-detail-modal');
    const activityDetailClose = document.getElementById('activity-detail-close');
    const activityDetailTitle = document.getElementById('activity-detail-title');
    const activityDetailDate = document.getElementById('activity-detail-date');
    const activityDetailLocation = document.getElementById('activity-detail-location');
    const activityDetailImageContainer = document.getElementById('activity-detail-image-container');
    const activityDetailDescription = document.getElementById('activity-detail-description');

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
            const safeGalleryTitle = (program.title || 'Program').replace(/"/g, '&quot;');
            programGalleryImages.innerHTML = program.images.map(src => `
                <div class="rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                    <img src="${src}" alt="${safeGalleryTitle} photo" title="${safeGalleryTitle} photo" loading="lazy" class="w-full h-48 object-cover" />
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

    function openAddActivityModal() {
        if (addActivityModal) {
            addActivityModal.classList.remove('hidden');
            addActivityModal.classList.add('flex');
        }
    }

    function closeAddActivityModal() {
        if (addActivityModal) {
            addActivityModal.classList.add('hidden');
            addActivityModal.classList.remove('flex');
        }
        if (addActivityForm) addActivityForm.reset();
    }

    function openActivityDetailModal(activity) {
        if (!activityDetailModal) return;

        activityDetailTitle.textContent = activity.title || 'Activity Details';
        activityDetailDate.textContent = new Date(activity.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        activityDetailLocation.textContent = activity.location || 'Location Unknown';
        activityDetailDescription.innerHTML = (activity.description || 'No description provided.').replace(/\n/g, '<br>');

        const fallbackImage = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';
        const displayImage = activity.image_url || fallbackImage;
        const activityTitle = activity.title || 'Program Activity';
        const activityLocation = activity.location || 'Unknown Location';
        const safeTitle = `Caritas Libmanan Field Update: ${activityTitle} at ${activityLocation}`.replace(/"/g, '&quot;');
        activityDetailImageContainer.innerHTML = `<img src="${displayImage}" alt="${safeTitle}" title="${safeTitle}" class="w-full h-auto object-contain max-h-[50vh]" />`;

        activityDetailModal.classList.remove('hidden');
        activityDetailModal.classList.add('flex');
    }

    function closeActivityDetailModal() {
        if (activityDetailModal) {
            activityDetailModal.classList.add('hidden');
            activityDetailModal.classList.remove('flex');
        }
    }

    function createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = "bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group";
        card.dataset.activity = JSON.stringify(activity);

        const fallbackImage = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80';
        const displayImage = activity.image_url || fallbackImage;
        const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });

        const activityTitle = activity.title || 'Program Activity';
        const activityLocation = activity.location || 'Unknown Location';
        const safeTitle = `Caritas Libmanan Field Update: ${activityTitle} at ${activityLocation}`.replace(/"/g, '&quot;');
        const shortDescription = (activity.description || '').length > 100
            ? (activity.description || '').substring(0, 100) + '...'
            : (activity.description || 'No description provided.');

        card.innerHTML = `
            <div class="relative h-48 overflow-hidden bg-gray-100">
              <img src="${displayImage}" alt="${safeTitle}" title="${safeTitle}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 mix-blend-normal">
              <div class="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 flex items-center space-x-1">
                <svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>${activity.location || 'Location Unknown'}</span>
              </div>
            </div>
            <div class="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <span class="text-xs font-semibold text-caritasCrimson tracking-wide uppercase block">${formattedDate}</span>
                <h3 class="font-heading font-extrabold text-xl text-deepCharcoal tracking-tight group-hover:text-caritasCrimson transition duration-150">${activity.title || 'Untitled Activity'}</h3>
                <p class="text-sm text-gray-600 font-normal leading-relaxed">${shortDescription}</p>
              </div>
              <div class="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span class="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Field Dispatch</span>
                <button type="button" class="view-full-report-btn text-xs font-bold text-caritasCrimson hover:text-red-900 flex items-center space-x-1">
                  <span>View Full Report</span>
                  <span>→</span>
                </button>
              </div>
            </div>
        `;
        return card;
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
            closeAddActivityModal();
            closeActivityDetailModal();
        }
    });

    if (addActivityBtn) addActivityBtn.addEventListener('click', openAddActivityModal);
    if (addActivityModalClose) addActivityModalClose.addEventListener('click', closeAddActivityModal);
    if (addActivityCancel) addActivityCancel.addEventListener('click', closeAddActivityModal);
    if (addActivityModal) {
        addActivityModal.addEventListener('click', event => {
            if (event.target === addActivityModal) {
                closeAddActivityModal();
            }
        });
    }

    if (activityDetailClose) {
        activityDetailClose.addEventListener('click', closeActivityDetailModal);
    }
    if (activityDetailModal) {
        activityDetailModal.addEventListener('click', event => {
            if (event.target === activityDetailModal) {
                closeActivityDetailModal();
            }
        });
    }

    const activitiesContainer = document.getElementById('activities-feed-container');
    if (activitiesContainer) {
        activitiesContainer.addEventListener('click', (event) => {
            const viewButton = event.target.closest('.view-full-report-btn');
            if (viewButton) {
                const card = viewButton.closest('[data-activity]');
                if (card && card.dataset.activity) {
                    openActivityDetailModal(JSON.parse(card.dataset.activity));
                }
            }
        });
    }

    if (addActivityForm) {
        addActivityForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;

            const newActivity = {
                title: document.getElementById('activity-title').value,
                description: document.getElementById('activity-description').value,
                location: document.getElementById('activity-location').value,
                image_url: document.getElementById('activity-image-url').value,
                date: document.getElementById('activity-date').value,
            };

            try {
                // 1. Authenticate with Supabase Auth
                const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (!authResponse.ok) {
                    throw new Error('Authentication failed. Please check your admin email and password.');
                }
                
                const authData = await authResponse.json();
                const accessToken = authData.access_token;

                // 1.5 Get the authenticated user's details to associate with the new activity
                const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Could not retrieve user details after authentication.');
                }

                const user = await userResponse.json();
                // Associate the activity with the logged-in user.
                // Assumes a 'user_id' column in your 'project_activities' table.
                newActivity.user_id = user.id;

                // 2. Insert the activity using the authenticated user's token
                const response = await fetch(`${SUPABASE_URL}/rest/v1/project_activities`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(newActivity)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add activity.');
                }

                const [createdActivity] = await response.json();
                const container = document.getElementById('activities-feed-container');
                const noActivitiesMessage = container.querySelector('.col-span-full');
                if (noActivitiesMessage) noActivitiesMessage.remove();
                
                container.prepend(createActivityCard(createdActivity));
                closeAddActivityModal();

            } catch (error) {
                console.error('Error adding activity:', error);
                alert('Error adding activity: ' + error.message);
            }
        });
    }

    async function fetchRecentActivities() {
  const container = document.getElementById('activities-feed-container');
  if (!container) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/project_activities?select=*&order=date.desc&limit=3`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch activities: ${response.status} ${errorText}`);
    }

    const activities = await response.json();
    renderActivitiesUI(activities);
  } catch (error) {
    console.error('Error syncing with project_activities table:', error);
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 font-medium">Could not load recent activities.</p>
                <p class="text-xs text-gray-400 mt-1">Please check the connection or try again later.</p>
            </div>
        `;
    }
  }
}

function renderActivitiesUI(activities) {
  const container = document.getElementById('activities-feed-container');
  if (!container) return;
  
  container.innerHTML = ''; // Clear existing content
  
  if (!activities || activities.length === 0) {
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <p class="text-gray-500">No recent activities to display at the moment.</p>
        </div>
    `;
  } else {
      activities.forEach(activity => {
          const cardElement = createActivityCard(activity);
          container.appendChild(cardElement);
      });
  }
}

fetchRecentActivities();
});