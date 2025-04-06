// 初始化默认数据
function initializeDefaultData() {
    console.log('初始化默认数据...');
    
    // 首页标题与描述默认数据
    const homeHeaderData = {
        homeTitle: "欢迎来到商务公司官网",
        homeSubtitle: "专业的商务服务提供商",
        homeDescription: "我们提供高质量的商务解决方案，满足您的各种需求。",
        ctaButtonText: "了解更多",
        ctaButtonLink: "#about"
    };
    saveToLocalStorage('homeHeaderForm', homeHeaderData);
    
    // 特色服务默认数据
    const featuredServicesData = {
        featuredServicesTitle: "我们的特色服务",
        featuredServicesDescription: "我们提供多种专业服务，满足您的不同需求。"
    };
    saveToLocalStorage('featuredServicesForm', featuredServicesData);
    
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
    saveToLocalStorage('upcomingMatchesForm', upcomingMatchesData);
    
    // 关于我们默认数据
    const aboutData = {
        aboutTitle: "关于我们",
        aboutDescription: "了解我们的团队和使命。"
    };
    saveToLocalStorage('aboutForm', aboutData);
    
    // 服务内容默认数据
    const servicesData = {
        servicesTitle: "我们的服务",
        servicesDescription: "探索我们提供的全方位服务。"
    };
    saveToLocalStorage('servicesForm', servicesData);
    
    // 案例展示默认数据
    const portfolioData = {
        portfolioTitle: "精选案例",
        portfolioDescription: "查看我们的成功案例。"
    };
    saveToLocalStorage('portfolioForm', portfolioData);
    
    // 团队成员默认数据
    const teamData = {
        teamTitle: "我们的团队",
        teamDescription: "认识我们专业的团队成员。"
    };
    saveToLocalStorage('teamForm', teamData);
    
    // 联系方式默认数据
    const contactData = {
        contactTitle: "联系我们",
        contactDescription: "有任何问题？请随时联系我们。",
        contactAddress: "北京市朝阳区某某街道100号",
        contactPhone: "+86 10 12345678",
        contactEmail: "info@example.com"
    };
    saveToLocalStorage('contactForm', contactData);
    
    // 媒体数据默认值
    const mediaData = {
        images: [],
        videos: [],
        backgrounds: []
    };
    saveToLocalStorage('mediaForm', mediaData);
    
    console.log('默认数据初始化完成');
    
    // 重新加载页面内容
    loadAllContent();
}
