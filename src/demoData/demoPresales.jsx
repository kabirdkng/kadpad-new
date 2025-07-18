// src/demoData/demoPresales.jsx
export const presales = [
    // Ongoing Sales
    {
        namespace: "free",
        moduleName: "IRonMan",
        tokendetails: {
            SYMBOL: 'RON',
            totalSupply: 1000000,
            imageUrl: 'https://content.imageresizer.com/images/memes/Iron-Man-meme-8.jpg'
        },
        salesDetails: {
            totalTokensToSale: 300000,
            tokensPerBatch: 1000,
            phase0price: 5,
            phase0startDate: new Date("2024-09-01T00:00:00Z"),
            phase0whitelist: [],
            phase1Price: 10,
            phase1StartDate: new Date("2024-09-15T00:00:00Z"),
            salesEndDate: new Date("2024-10-01T00:00:00Z"),
            counters: { sold: 150000, reserved: 50000 }
        }
    },
    {
        namespace: "premium",
        moduleName: "CryptoKitties",
        tokendetails: {
            SYMBOL: 'MEOW',
            totalSupply: 10000000,
            imageUrl: 'https://i.pinimg.com/originals/ec/e9/3c/ece93ca911ae55f73b250aec2ead1c4a.jpg'
        },
        salesDetails: {
            totalTokensToSale: 5000000,
            tokensPerBatch: 10000,
            phase0price: 0.1,
            phase0startDate: new Date("2024-08-25T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.2,
            phase1StartDate: new Date("2024-09-10T12:00:00Z"),
            salesEndDate: new Date("2024-09-30T23:59:59Z"),
            counters: { sold: 2500000, reserved: 500000 }
        }
    },
    {
        namespace: "standard",
        moduleName: "DeFiDreams",
        tokendetails: {
            SYMBOL: 'DREAM',
            totalSupply: 50000000,
            imageUrl: 'https://images.squarespace-cdn.com/content/v1/59af5a43cd39c3ef8000a039/1508428371025-I6HSQBYGCF6G8374U3MX/DreamConf_portfolio_banner.jpg?format=1500w'
        },
        salesDetails: {
            totalTokensToSale: 25000000,
            tokensPerBatch: 50000,
            phase0price: 0.05,
            phase0startDate: new Date("2024-09-05T09:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.08,
            phase1StartDate: new Date("2024-09-20T09:00:00Z"),
            salesEndDate: new Date("2024-10-05T23:59:59Z"),
            counters: { sold: 12500000, reserved: 2500000 }
        }
    },
    {
        namespace: "enterprise",
        moduleName: "BlockchainBridge",
        tokendetails: {
            SYMBOL: 'BRDG',
            totalSupply: 100000000,
            imageUrl: 'https://www.freevector.com/uploads/vector/preview/25563/brooklyn2-01.jpg'
        },
        salesDetails: {
            totalTokensToSale: 70000000,
            tokensPerBatch: 100000,
            phase0price: 0.02,
            phase0startDate: new Date("2024-08-18T15:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.03,
            phase1StartDate: new Date("2024-09-02T15:00:00Z"),
            salesEndDate: new Date("2024-09-20T23:59:59Z"),
            counters: { sold: 35000000, reserved: 7000000 }
        }
    },
    {
        namespace: "community",
        moduleName: "SocialToken",
        tokendetails: {
            SYMBOL: 'SOCL',
            totalSupply: 500000000,
            imageUrl: 'https://www.shutterstock.com/image-vector/word-social-written-isolated-hand-260nw-521027344.jpg'
        },
        salesDetails: {
            totalTokensToSale: 250000000,
            tokensPerBatch: 500000,
            phase0price: 0.01,
            phase0startDate: new Date("2024-09-10T10:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.015,
            phase1StartDate: new Date("2024-09-25T10:00:00Z"),
            salesEndDate: new Date("2024-10-10T23:59:59Z"),
            counters: { sold: 125000000, reserved: 25000000 }
        }
    },
    {
        namespace: "ai",
        moduleName: "NeuralNetworkToken",
        tokendetails: {
            SYMBOL: 'NNT',
            totalSupply: 1000000000,
            imageUrl: 'https://pics.craiyon.com/2023-09-20/f80b0fc513f14f0d9ecc9d7d03632d12.webp'
        },
        salesDetails: {
            totalTokensToSale: 500000000,
            tokensPerBatch: 1000000,
            phase0price: 0.005,
            phase0startDate: new Date("2024-09-15T14:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.0075,
            phase1StartDate: new Date("2024-09-30T14:00:00Z"),
            salesEndDate: new Date("2024-10-15T23:59:59Z"),
            counters: { sold: 0, reserved: 50000000 }
        }
    },
    {
        namespace: "green",
        moduleName: "EcoFriendlyToken",
        tokendetails: {
            SYMBOL: 'ECO',
            totalSupply: 200000000,
            imageUrl: 'https://stability-images-upload.s3.amazonaws.com/v1_txt2img_199734f2-ca4b-4992-b883-2e3fd946b4c8.png'
        },
        salesDetails: {
            totalTokensToSale: 100000000,
            tokensPerBatch: 200000,
            phase0price: 0.03,
            phase0startDate: new Date("2024-09-20T09:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.045,
            phase1StartDate: new Date("2024-10-05T09:00:00Z"),
            salesEndDate: new Date("2024-10-20T23:59:59Z"),
            counters: { sold: 0, reserved: 10000000 }
        }
    },
    {
        namespace: "education",
        moduleName: "LearnToEarnToken",
        tokendetails: {
            SYMBOL: 'LEARN',
            totalSupply: 300000000,
            imageUrl: 'https://www.edverse.com/blog/assets/admin/uploads/Learn-to-Earn.jpg'
        },
        salesDetails: {
            totalTokensToSale: 150000000,
            tokensPerBatch: 300000,
            phase0price: 0.02,
            phase0startDate: new Date("2024-09-25T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.03,
            phase1StartDate: new Date("2024-10-10T12:00:00Z"),
            salesEndDate: new Date("2024-10-25T23:59:59Z"),
            counters: { sold: 0, reserved: 15000000 }
        }
    },
    {
        namespace: "health",
        moduleName: "FitnessRewardToken",
        tokendetails: {
            SYMBOL: 'FIT',
            totalSupply: 400000000,
            imageUrl: 'https://i.pinimg.com/736x/6d/6d/82/6d6d82bf4d0ec850df8f8a0f6d929aed.jpg'
        },
        salesDetails: {
            totalTokensToSale: 200000000,
            tokensPerBatch: 400000,
            phase0price: 0.015,
            phase0startDate: new Date("2024-09-30T08:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.0225,
            phase1StartDate: new Date("2024-10-15T08:00:00Z"),
            salesEndDate: new Date("2024-10-30T23:59:59Z"),
            counters: { sold: 0, reserved: 20000000 }
        }
    },

    // Upcoming Sales
    {
        namespace: "exclusive",
        moduleName: "PixelArt",
        tokendetails: {
            SYMBOL: 'PIX',
            totalSupply: 1000000,
            imageUrl: 'https://vectordiary.com/wp-content/uploads/2021/09/20-best-pixel-art-in-2021-featured-image.jpg'
        },
        salesDetails: {
            totalTokensToSale: 500000,
            tokensPerBatch: 1000,
            phase0price: 1,
            phase0startDate: new Date("2024-10-01T15:00:00Z"),
            phase0whitelist: [],
            phase1Price: 1.5,
            phase1StartDate: new Date("2024-10-15T15:00:00Z"),
            salesEndDate: new Date("2024-10-30T23:59:59Z"),
            counters: { sold: 0, reserved: 100000 }
        }
    },
    {
        namespace: "gaming",
        moduleName: "CryptoLegends",
        tokendetails: {
            SYMBOL: 'CLEG',
            totalSupply: 100000000,
            imageUrl: 'https://i.pinimg.com/originals/0a/76/19/0a7619eba2d432440223afdd6303cbfe.jpg'
        },
        salesDetails: {
            totalTokensToSale: 50000000,
            tokensPerBatch: 100000,
            phase0price: 0.01,
            phase0startDate: new Date("2024-11-01T09:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.015,
            phase1StartDate: new Date("2024-11-15T09:00:00Z"),
            salesEndDate: new Date("2024-11-30T23:59:59Z"),
            counters: { sold: 0, reserved: 5000000 }
        }
    },
    {
        namespace: "nft",
        moduleName: "ArtificialDreams",
        tokendetails: {
            SYMBOL: 'ADREAM',
            totalSupply: 10000,
            imageUrl: 'https://mymodernmet.com/wp/wp-content/uploads/archive/bmhIp5U6sowoqAxAJsYh_1082131210.jpeg'
        },
        salesDetails: {
            totalTokensToSale: 8000,
            tokensPerBatch: 100,
            phase0price: 0.5,
            phase0startDate: new Date("2024-12-01T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.75,
            phase1StartDate: new Date("2024-12-15T12:00:00Z"),
            salesEndDate: new Date("2024-12-31T23:59:59Z"),
            counters: { sold: 0, reserved: 1000 }
        }
    },
    {
        namespace: "defi",
        moduleName: "YieldOptimizer",
        tokendetails: {
            SYMBOL: 'YOPT',
            totalSupply: 20000000,
            imageUrl: 'https://coincodex.com/en/resources/images//admin/news/what-is-yield-farmin-1/what-is-crypto-yield-farming.png:resizeboxcropjpg?1600x900'
        },
        salesDetails: {
            totalTokensToSale: 10000000,
            tokensPerBatch: 50000,
            phase0price: 0.1,
            phase0startDate: new Date("2025-01-01T00:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.15,
            phase1StartDate: new Date("2025-01-15T00:00:00Z"),
            salesEndDate: new Date("2025-01-31T23:59:59Z"),
            counters: { sold: 0, reserved: 2000000 }
        }
    },
    {
        namespace: "music",
        moduleName: "MelodyToken",
        tokendetails: {
            SYMBOL: 'MELODY',
            totalSupply: 50000000,
            imageUrl: 'https://i.pinimg.com/736x/eb/00/43/eb0043013ed09261376800a1365da76a.jpg'
        },
        salesDetails: {
            totalTokensToSale: 25000000,
            tokensPerBatch: 50000,
            phase0price: 0.05,
            phase0startDate: new Date("2025-02-01T10:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.075,
            phase1StartDate: new Date("2025-02-15T10:00:00Z"),
            salesEndDate: new Date("2025-02-28T23:59:59Z"),
            counters: { sold: 0, reserved: 2500000 }
        }
    },
    {
        namespace: "travel",
        moduleName: "WanderLustCoin",
        tokendetails: {
            SYMBOL: 'WANDER',
            totalSupply: 150000000,
            imageUrl: 'https://st3.depositphotos.com/1007566/13927/v/450/depositphotos_139270918-stock-illustration-wanderlust-spirit-design.jpg'
        },
        salesDetails: {
            totalTokensToSale: 75000000,
            tokensPerBatch: 150000,
            phase0price: 0.02,
            phase0startDate: new Date("2025-03-01T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.03,
            phase1StartDate: new Date("2025-03-15T12:00:00Z"),
            salesEndDate: new Date("2025-03-31T23:59:59Z"),
            counters: { sold: 0, reserved: 7500000 }
        }
    },
    {
        namespace: "food",
        moduleName: "CulinaryToken",
        tokendetails: {
            SYMBOL: 'YUMMY',
            totalSupply: 80000000,
            imageUrl: 'https://www.institutescoffier.com/wp-content/uploads/2023/10/culinary-arts-management.webp'
        },
        salesDetails: {
            totalTokensToSale: 40000000,
            tokensPerBatch: 80000,
            phase0price: 0.025,
            phase0startDate: new Date("2025-04-01T09:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.0375,
            phase1StartDate: new Date("2025-04-15T09:00:00Z"),
            salesEndDate: new Date("2025-04-30T23:59:59Z"),
            counters: { sold: 0, reserved: 4000000 }
        }
    },
    {
        namespace: "sports",
        moduleName: "AthleteCoin",
        tokendetails: {
            SYMBOL: 'ATHLETE',
            totalSupply: 200000000,
            imageUrl: 'https://cdn.textstudio.com/output/sample/normal/6/6/6/4/athlete-logo-73-14666.png'
        },
        salesDetails: {
            totalTokensToSale: 100000000,
            tokensPerBatch: 200000,
            phase0price: 0.015,
            phase0startDate: new Date("2025-05-01T14:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.0225,
            phase1StartDate: new Date("2025-05-15T14:00:00Z"),
            salesEndDate: new Date("2025-05-31T23:59:59Z"),
            counters: { sold: 0, reserved: 10000000 }
        }
    },
    {
        namespace: "fashion",
        moduleName: "StyleToken",
        tokendetails: {
            SYMBOL: 'STYLE',
            totalSupply: 120000000,
            imageUrl: 'https://www.creativefabrica.com/wp-content/uploads/2022/08/26/fashion-Graphics-37130444-1.png'
        },
        salesDetails: {
            totalTokensToSale: 60000000,
            tokensPerBatch: 120000,
            phase0price: 0.05,
            phase0startDate: new Date("2024-08-01T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.08,
            phase1StartDate: new Date("2024-08-15T12:00:00Z"),
            salesEndDate: new Date("2024-08-31T23:59:59Z"),
            counters: { sold: 9000000, reserved: 10000000 }
        }
    }
];
