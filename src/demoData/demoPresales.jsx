// src/demoData/demoPresales.jsx
export const presales = [
    // Live/Ongoing Sales (Current date: June 19, 2025)
    {
        _id: "live-001",
        namespace: "free",
        moduleName: "KadenaKing",
        status: "launched",
        tokendetails: {
            SYMBOL: 'KKING',
            totalSupply: 100000000,
            imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalBatches: 50,
            amountPerBatch: 1000,
            presalesAmount: 50000,
            liquidityLockupAmount: 10000,
            treasuryAmount: 39950000,
            whitelistLimit: 5,
            // Legacy fields for compatibility
            totalTokensToSale: 50000,
            tokensPerBatch: 1000,
            phase0price: 0.5,
            phase0startDate: new Date("2025-06-01T00:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.8,
            phase1StartDate: new Date("2025-06-15T00:00:00Z"),
            salesEndDate: new Date("2025-08-15T23:59:59Z"),
            counters: { sold: 35000, reserved: 8000 }
        }
    },
    {
        _id: "live-002",
        namespace: "premium",
        moduleName: "DegenCoin",
        status: "launched",
        tokendetails: {
            SYMBOL: 'DEGEN',
            totalSupply: 1000000000,
            imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalBatches: 100,
            amountPerBatch: 5000,
            presalesAmount: 500000,
            liquidityLockupAmount: 100000,
            treasuryAmount: 399500000,
            whitelistLimit: 3,
            // Legacy fields for compatibility
            totalTokensToSale: 500000,
            tokensPerBatch: 5000,
            phase0price: 0.001,
            phase0startDate: new Date("2025-05-20T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.002,
            phase1StartDate: new Date("2025-06-05T12:00:00Z"),
            salesEndDate: new Date("2025-07-31T23:59:59Z"),
            counters: { sold: 380000, reserved: 45000 }
        }
    },
    {
        _id: "live-003",
        namespace: "gaming",
        moduleName: "PixelWarrior",
        status: "launched",
        tokendetails: {
            SYMBOL: 'PIXEL',
            totalSupply: 500000000,
            imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 200000,
            tokensPerBatch: 2000,
            phase0price: 0.05,
            phase0startDate: new Date("2025-06-10T15:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.08,
            phase1StartDate: new Date("2025-06-25T15:00:00Z"),
            salesEndDate: new Date("2025-09-01T23:59:59Z"),
            counters: { sold: 145000, reserved: 25000 }
        }
    },
    {
        _id: "live-004",
        namespace: "defi",
        moduleName: "YieldMaster",
        status: "launched",
        tokendetails: {
            SYMBOL: 'YIELD',
            totalSupply: 50000000,
            imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 25000,
            tokensPerBatch: 500,
            phase0price: 2.5,
            phase0startDate: new Date("2025-05-28T09:00:00Z"),
            phase0whitelist: [],
            phase1Price: 3.5,
            phase1StartDate: new Date("2025-06-12T09:00:00Z"),
            salesEndDate: new Date("2025-08-28T23:59:59Z"),
            counters: { sold: 18500, reserved: 3200 }
        }
    },
    {
        _id: "live-005",
        namespace: "ai",
        moduleName: "NeuralChain",
        status: "launched",
        tokendetails: {
            SYMBOL: 'NEURAL',
            totalSupply: 2000000000,
            imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 800000,
            tokensPerBatch: 8000,
            phase0price: 0.01,
            phase0startDate: new Date("2025-06-05T18:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.015,
            phase1StartDate: new Date("2025-06-20T18:00:00Z"),
            salesEndDate: new Date("2025-10-01T23:59:59Z"),
            counters: { sold: 620000, reserved: 80000 }
        }
    },
    {
        _id: "live-006",
        namespace: "music",
        moduleName: "BeatCoin",
        status: "launched",
        tokendetails: {
            SYMBOL: 'BEAT',
            totalSupply: 100000000,
            imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 60000,
            tokensPerBatch: 600,
            phase0price: 0.3,
            phase0startDate: new Date("2025-06-01T18:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.5,
            phase1StartDate: new Date("2025-06-16T18:00:00Z"),
            salesEndDate: new Date("2025-08-28T23:59:59Z"),
            counters: { sold: 42000, reserved: 9000 }
        }
    },
    {
        _id: "live-007",
        namespace: "finance",
        moduleName: "StableFi",
        status: "launched",
        tokendetails: {
            SYMBOL: 'STFI',
            totalSupply: 1000000000,
            imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 400000,
            tokensPerBatch: 4000,
            phase0price: 0.1,
            phase0startDate: new Date("2025-05-25T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.15,
            phase1StartDate: new Date("2025-06-10T12:00:00Z"),
            salesEndDate: new Date("2025-09-25T23:59:59Z"),
            counters: { sold: 280000, reserved: 60000 }
        }
    },

    // Upcoming Sales
    {
        _id: "upcoming-001",
        namespace: "meme",
        moduleName: "MoonDoge",
        status: "launched",
        tokendetails: {
            SYMBOL: 'MDOGE',
            totalSupply: 10000000000,
            imageUrl: 'https://images.unsplash.com/photo-1605979399582-3d0fa232a51d?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 5000000,
            tokensPerBatch: 50000,
            phase0price: 0.0001,
            phase0startDate: new Date("2025-07-15T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.0002,
            phase1StartDate: new Date("2025-07-30T12:00:00Z"),
            salesEndDate: new Date("2025-09-15T23:59:59Z"),
            counters: { sold: 0, reserved: 500000 }
        }
    },
    {
        _id: "upcoming-002",
        namespace: "metaverse",
        moduleName: "VirtualLand",
        status: "launched",
        tokendetails: {
            SYMBOL: 'VLAND',
            totalSupply: 100000000,
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 40000,
            tokensPerBatch: 400,
            phase0price: 5.0,
            phase0startDate: new Date("2025-07-20T16:00:00Z"),
            phase0whitelist: [],
            phase1Price: 7.5,
            phase1StartDate: new Date("2025-08-05T16:00:00Z"),
            salesEndDate: new Date("2025-10-20T23:59:59Z"),
            counters: { sold: 0, reserved: 8000 }
        }
    },
    {
        _id: "upcoming-003",
        namespace: "nft",
        moduleName: "ArtisticSoul",
        status: "launched",
        tokendetails: {
            SYMBOL: 'ARTS',
            totalSupply: 1000000,
            imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 500,
            tokensPerBatch: 10,
            phase0price: 50.0,
            phase0startDate: new Date("2025-08-01T14:00:00Z"),
            phase0whitelist: [],
            phase1Price: 75.0,
            phase1StartDate: new Date("2025-08-15T14:00:00Z"),
            salesEndDate: new Date("2025-09-30T23:59:59Z"),
            counters: { sold: 0, reserved: 100 }
        }
    },
    {
        _id: "upcoming-004",
        namespace: "green",
        moduleName: "EcoChain",
        status: "launched",
        tokendetails: {
            SYMBOL: 'ECO',
            totalSupply: 1000000000,
            imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 300000,
            tokensPerBatch: 3000,
            phase0price: 0.25,
            phase0startDate: new Date("2025-08-10T10:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.4,
            phase1StartDate: new Date("2025-08-25T10:00:00Z"),
            salesEndDate: new Date("2025-11-10T23:59:59Z"),
            counters: { sold: 0, reserved: 45000 }
        }
    },
    {
        _id: "upcoming-005",
        namespace: "sport",
        moduleName: "FanToken",
        status: "launched",
        tokendetails: {
            SYMBOL: 'FAN',
            totalSupply: 500000000,
            imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 150000,
            tokensPerBatch: 1500,
            phase0price: 0.5,
            phase0startDate: new Date("2025-08-14T20:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.8,
            phase1StartDate: new Date("2025-09-01T20:00:00Z"),
            salesEndDate: new Date("2025-10-30T23:59:59Z"),
            counters: { sold: 0, reserved: 22500 }
        }
    },
    {
        _id: "upcoming-006",
        namespace: "health",
        moduleName: "WellnessChain",
        status: "launched",
        tokendetails: {
            SYMBOL: 'WELL',
            totalSupply: 500000000,
            imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 200000,
            tokensPerBatch: 2000,
            phase0price: 0.15,
            phase0startDate: new Date("2025-07-25T11:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.25,
            phase1StartDate: new Date("2025-08-10T11:00:00Z"),
            salesEndDate: new Date("2025-10-25T23:59:59Z"),
            counters: { sold: 0, reserved: 30000 }
        }
    },
    {
        _id: "upcoming-007",
        namespace: "education",
        moduleName: "LearnToken",
        status: "launched",
        tokendetails: {
            SYMBOL: 'LEARN',
            totalSupply: 300000000,
            imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 120000,
            tokensPerBatch: 1200,
            phase0price: 0.2,
            phase0startDate: new Date("2025-08-05T13:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.35,
            phase1StartDate: new Date("2025-08-20T13:00:00Z"),
            salesEndDate: new Date("2025-11-05T23:59:59Z"),
            counters: { sold: 0, reserved: 18000 }
        }
    },

    // Recently Ended Sales
    {
        _id: "ended-001",
        namespace: "classic",
        moduleName: "RetroToken",
        status: "launched",
        tokendetails: {
            SYMBOL: 'RETRO',
            totalSupply: 50000000,
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 25000,
            tokensPerBatch: 500,
            phase0price: 1.0,
            phase0startDate: new Date("2025-04-01T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 1.5,
            phase1StartDate: new Date("2025-04-15T12:00:00Z"),
            salesEndDate: new Date("2025-05-30T23:59:59Z"),
            counters: { sold: 25000, reserved: 0 }
        }
    },
    {
        _id: "ended-002",
        namespace: "tech",
        moduleName: "QuantumLeap",
        status: "launched",
        tokendetails: {
            SYMBOL: 'QUANTUM',
            totalSupply: 100000000,
            imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 50000,
            tokensPerBatch: 1000,
            phase0price: 0.8,
            phase0startDate: new Date("2025-03-15T09:00:00Z"),
            phase0whitelist: [],
            phase1Price: 1.2,
            phase1StartDate: new Date("2025-04-01T09:00:00Z"),
            salesEndDate: new Date("2025-05-15T23:59:59Z"),
            counters: { sold: 48500, reserved: 1500 }
        }
    },
    {
        _id: "ended-003",
        namespace: "social",
        moduleName: "CommunityFirst",
        status: "launched",
        tokendetails: {
            SYMBOL: 'COMM',
            totalSupply: 2000000000,
            imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 800000,
            tokensPerBatch: 8000,
            phase0price: 0.005,
            phase0startDate: new Date("2025-02-20T15:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.008,
            phase1StartDate: new Date("2025-03-05T15:00:00Z"),
            salesEndDate: new Date("2025-04-30T23:59:59Z"),
            counters: { sold: 750000, reserved: 50000 }
        }
    },
    {
        _id: "ended-004",
        namespace: "startup",
        moduleName: "InnovateCoin",
        status: "launched",
        tokendetails: {
            SYMBOL: 'INNO',
            totalSupply: 200000000,
            imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 80000,
            tokensPerBatch: 800,
            phase0price: 0.75,
            phase0startDate: new Date("2025-03-01T10:00:00Z"),
            phase0whitelist: [],
            phase1Price: 1.0,
            phase1StartDate: new Date("2025-03-16T10:00:00Z"),
            salesEndDate: new Date("2025-05-01T23:59:59Z"),
            counters: { sold: 78000, reserved: 2000 }
        }
    },
    {
        _id: "ended-005",
        namespace: "media",
        moduleName: "ContentCreator",
        status: "launched",
        tokendetails: {
            SYMBOL: 'CREATE',
            totalSupply: 500000000,
            imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 250000,
            tokensPerBatch: 2500,
            phase0price: 0.08,
            phase0startDate: new Date("2025-03-10T16:00:00Z"),
            phase0whitelist: [],
            phase1Price: 0.12,
            phase1StartDate: new Date("2025-03-25T16:00:00Z"),
            salesEndDate: new Date("2025-05-10T23:59:59Z"),
            counters: { sold: 235000, reserved: 15000 }
        }
    },
    {
        _id: "ended-006",
        namespace: "travel",
        moduleName: "WanderToken",
        status: "launched",
        tokendetails: {
            SYMBOL: 'WANDER',
            totalSupply: 150000000,
            imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop&crop=center'
        },
        salesDetails: {
            totalTokensToSale: 60000,
            tokensPerBatch: 600,
            phase0price: 1.25,
            phase0startDate: new Date("2025-02-14T12:00:00Z"),
            phase0whitelist: [],
            phase1Price: 1.75,
            phase1StartDate: new Date("2025-03-01T12:00:00Z"),
            salesEndDate: new Date("2025-04-15T23:59:59Z"),
            counters: { sold: 58500, reserved: 1500 }
        }
    }
];

// Helper function to get projects by status
export const getProjectsByStatus = () => {
    const currentDate = new Date();
    
    const ongoing = presales.filter(sale => {
        const startDate = new Date(sale.salesDetails.phase0startDate);
        const endDate = new Date(sale.salesDetails.salesEndDate);
        return startDate <= currentDate && endDate >= currentDate;
    });
    
    const upcoming = presales.filter(sale => {
        const startDate = new Date(sale.salesDetails.phase0startDate);
        return startDate > currentDate;
    });
    
    const ended = presales.filter(sale => {
        const endDate = new Date(sale.salesDetails.salesEndDate);
        return endDate < currentDate;
    });
    
    return { ongoing, upcoming, ended };
};

// Helper function to get featured projects (high progress or new)
export const getFeaturedProjects = () => {
    const currentDate = new Date();
    
    return presales.filter(sale => {
        const startDate = new Date(sale.salesDetails.phase0startDate);
        const endDate = new Date(sale.salesDetails.salesEndDate);
        const isLive = startDate <= currentDate && endDate >= currentDate;
        const progressPercent = (sale.salesDetails.counters.sold / sale.salesDetails.totalTokensToSale) * 100;
        
        // Featured if: live and (high progress OR recently started)
        if (isLive) {
            const daysSinceStart = (currentDate - startDate) / (1000 * 60 * 60 * 24);
            return progressPercent > 70 || daysSinceStart < 7;
        }
        
        return false;
    }).slice(0, 6);
};