// 初始化默认数据
window.initializeDefaultData = function() {
    console.log('初始化默认数据...');
    
    // 首页标题与描述默认数据
    const homeHeaderData = {
        homeTitle: "欢迎来到商务公司官网",
        homeSubtitle: "专业的商务服务提供商",
        homeDescription: "我们提供高质量的商务解决方案，满足您的各种需求。",
        ctaButtonText: "了解更多",
        ctaButtonLink: "#about"
    };
    saveDataToStorage('homeHeaderForm', homeHeaderData);
    
    // 特色服务默认数据
    const featuredServicesData = {
        featuredServicesTitle: "我们的特色服务",
        featuredServicesDescription: "我们提供多种专业服务，满足您的不同需求。"
    };
    saveDataToStorage('featuredServicesForm', featuredServicesData);
    
    // 即将到来的比赛默认数据
    const upcomingMatchesData = {
        upcomingMatchesTitle: "即将举行的比赛",
        upcomingMatchesDescription: "关注最新的电竞赛事，不要错过任何精彩瞬间。",
        match1Teams: "TSB vs. Wolves",
        match1Date: "2025-04-15",
        match1Time: "20:00",
        match1PrizePool: "10000",
        match1PrizeLabel: "奖金池",
        match1Team1Logo: "../assets/picture/team1.png",
        match1Team2Logo: "../assets/picture/team2.png",
        match2Teams: "Dragons vs. Tigers",
        match2Date: "2025-04-20",
        match2Time: "19:30",
        match2PrizePool: "15000",
        match2PrizeLabel: "奖金池",
        match2Team1Logo: "../assets/picture/team1.png",
        match2Team2Logo: "../assets/picture/team2.png",
        match3Teams: "Sharks vs. Eagles",
        match3Date: "2025-04-25",
        match3Time: "21:00",
        match3PrizePool: "12000",
        match3PrizeLabel: "奖金池",
        match3Team1Logo: "../assets/picture/team1.png",
        match3Team2Logo: "../assets/picture/team2.png",
        match4Teams: "Lions vs. Hawks",
        match4Date: "2025-04-30",
        match4Time: "18:30",
        match4PrizePool: "20000",
        match4PrizeLabel: "奖金池",
        match4Team1Logo: "../assets/picture/team1.png",
        match4Team2Logo: "../assets/picture/team2.png"
    };
    saveDataToStorage('upcomingMatchesForm', upcomingMatchesData);
    
    // 关于我们默认数据
    const aboutData = {
        aboutTitle: "关于我们",
        aboutDescription: "了解我们的团队和使命。"
    };
    saveDataToStorage('aboutForm', aboutData);
    
    // 服务内容默认数据
    const servicesData = {
        servicesTitle: "我们的服务",
        servicesDescription: "探索我们提供的全方位服务。"
    };
    saveDataToStorage('servicesForm', servicesData);
    
    // 关于我们页面默认数据
    const aboutFormData = {
        title: "About | Crox E-Sports",
        videoUrl: "../assets/file/25628048.mp4",
        videoThumbnail: "../assets/picture/about_video.png",
        gameTitle: "Play Fun And Enjoy The Games",
        gameDescription: "Our gaming community is built on the passion for competitive gaming. We bring together talented players, dedicated coaches, and enthusiastic fans to create a vibrant ecosystem for esports.",
        gameImage: "../assets/picture/about_game.png",
        ctaButtonText: "Join Now",
        ctaButtonLink: "signup.html",
        teamTitle: "Our Team Members",
        teamMembers: [
            {
                name: "Senchy Dark",
                role: "Pro-Player",
                image: "../assets/picture/team_member_1.jpg"
            },
            {
                name: "Eleten Rampel",
                role: "Pro-Player",
                image: "../assets/picture/team_member_2.jpg"
            },
            {
                name: "Andre Park",
                role: "Pro-Player",
                image: "../assets/picture/team_member_3.jpg"
            },
            {
                name: "Jonathan Clark",
                role: "Pro-Player",
                image: "../assets/picture/team_member_4.jpg"
            },
            {
                name: "Zenith Jark",
                role: "Pro-Player",
                image: "../assets/picture/team_member_5.jpg"
            },
            {
                name: "Jason Compile",
                role: "Pro-Player",
                image: "../assets/picture/team_member_6.jpg"
            }
        ],
        reviewTitle: "Clients Reviews",
        reviews: [
            {
                name: "Emily Johnson",
                role: "Sponsor",
                image: "../assets/picture/clints_review_1.jpg",
                content: "Working with Crox E-Sports has been an amazing experience. The team is professional and delivers exceptional gaming tournaments. Their attention to detail and passion for esports is evident in everything they do."
            },
            {
                name: "Michael Wilson",
                role: "Event Partner",
                image: "../assets/picture/clints_review_2.jpg",
                content: "We've partnered with Crox E-Sports for multiple gaming events, and each time they've exceeded our expectations. Their team is responsive, creative, and dedicated to creating memorable gaming experiences."
            }
        ]
    };
    saveDataToStorage('aboutForm', aboutFormData);
    
    // 案例展示默认数据
    const portfolioData = {
        portfolioTitle: "精选案例",
        portfolioDescription: "查看我们的成功案例。"
    };
    saveDataToStorage('portfolioForm', portfolioData);
    
    // 团队成员默认数据
    const teamData = {
        teamTitle: "我们的团队",
        teamDescription: "认识我们专业的团队成员。"
    };
    saveDataToStorage('teamForm', teamData);
    
    // 联系方式默认数据
    const contactData = {
        contactTitle: "联系我们",
        contactDescription: "有任何问题？请随时联系我们。",
        contactAddress: "北京市朝阳区某某街道100号",
        contactPhone: "+86 10 12345678",
        contactEmail: "info@example.com"
    };
    saveDataToStorage('contactForm', contactData);
    
    // 媒体数据默认值
    const mediaData = {
        images: [],
        videos: [],
        backgrounds: []
    };
    saveDataToStorage('mediaForm', mediaData);
    
    console.log('默认数据初始化完成');
    
    // 只有当localStorage中没有已保存的数据时才刷新页面
    const hasInitialized = localStorage.getItem('hasInitializedDefaults');
    if (!hasInitialized) {
        console.log('首次初始化，将设置标记并刷新页面');
        localStorage.setItem('hasInitializedDefaults', 'true');
        setTimeout(function() {
            window.location.reload();
        }, 500);
    } else {
        console.log('已经初始化过，不需要刷新页面');
    }
};

// 辅助函数：保存数据到本地存储
function saveDataToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`已保存${key}的默认数据`);
        return true;
    } catch (e) {
        console.error('保存到本地存储失败:', e);
        return false;
    }
}
