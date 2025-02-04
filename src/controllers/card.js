const cardDetail = (req, res) => {
    const data = [
        {
            id: 1,
            type: 'Beginner',
            title: 'Beginer 1',
            description: 'Learn the basics of cybersecurity.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 2,
            type: 'Web',
            title: 'Beginer 2',
            description: 'Challenge your skills with advanced problems.',
            img_path: 'https://www.foley.com/wp-content/uploads/2024/08/cybersecuritylock1680x680.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 3,
            type: 'Crypto',
            title: 'Beginer 3',
            description: 'Dive into cryptographic challenges.',
            img_path: 'https://www.mckinsey.com/spContent/bespoke/tech-trends-2024-hero-nav/techtrends-hero-desktop.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 4,
            type: 'Web',
            title: 'Beginer 4',
            description: 'Explore web security and vulnerabilities.',
            img_path: 'https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_640.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 5,
            type: 'Pwn',
            title: 'Beginer 5',
            description: 'Strengthen your problem-solving abilities.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 6,
            type: 'Pwn',
            title: 'Beginer 6',
            description: 'Learn binary exploitation techniques.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 7,
            type: 'Beginner',
            title: 'Beginer 1',
            description: 'Learn the basics of cybersecurity.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 8,
            type: 'Web',
            title: 'Beginer 2',
            description: 'Challenge your skills with advanced problems.',
            img_path: 'https://www.foley.com/wp-content/uploads/2024/08/cybersecuritylock1680x680.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 9,
            type: 'Crypto',
            title: 'Beginer 3',
            description: 'Dive into cryptographic challenges.',
            img_path: 'https://www.mckinsey.com/spContent/bespoke/tech-trends-2024-hero-nav/techtrends-hero-desktop.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 10,
            type: 'Web',
            title: 'Beginer 4',
            description: 'Explore web security and vulnerabilities.',
            img_path: 'https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_640.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 11,
            type: 'Pwn',
            title: 'Beginer 5',
            description: 'Strengthen your problem-solving abilities.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 12,
            type: 'Pwn',
            title: 'Beginer 6',
            description: 'Learn binary exploitation techniques.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 13,
            type: 'Beginner',
            title: 'Beginer 1',
            description: 'Learn the basics of cybersecurity.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 14,
            type: 'Web',
            title: 'Beginer 2',
            description: 'Challenge your skills with advanced problems.',
            img_path: 'https://www.foley.com/wp-content/uploads/2024/08/cybersecuritylock1680x680.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 15,
            type: 'Crypto',
            title: 'Beginer 3',
            description: 'Dive into cryptographic challenges.',
            img_path: 'https://www.mckinsey.com/spContent/bespoke/tech-trends-2024-hero-nav/techtrends-hero-desktop.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 16,
            type: 'Web',
            title: 'Beginer 4',
            description: 'Explore web security and vulnerabilities.',
            img_path: 'https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_640.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 17,
            type: 'Pwn',
            title: 'Beginer 5',
            description: 'Strengthen your problem-solving abilities.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
        {
            id: 18,
            type: 'Pwn',
            title: 'Beginer 6',
            description: 'Learn binary exploitation techniques.',
            img_path: 'https://online.stanford.edu/sites/default/files/styles/widescreen_tiny/public/2019-07/hack-lab_INTLPOL268.jpg',
            route_path: '/proposition/id'
        },
    ];

    return res.status(200).json({ 
        card_detail: [data]
    });
};

module.exports = {
    cardDetail
};