flowchart TD
    A[User Connects Wallet] --> B[Check $KPAD Balance]
    B --> C{Has Sufficient $KPAD?}
    C -->|No| D[Show Insufficient Balance Error]
    C -->|Yes| E[Select Staking Tier]
    
    E --> F{Choose Tier}
    F -->|Node| G[Node Tier<br/>Min: 50,000 $KPAD<br/>Lockup: 1 Year<br/>IDO Benefit: 10 random allocations]
    F -->|Cluster| H[Cluster Tier<br/>Min: 150,000 $KPAD<br/>Lockup: 1 Year<br/>IDO Benefit: 25 random allocations]
    F -->|Chainweb| I[Chainweb Tier<br/>Min: 350,000 $KPAD<br/>Lockup: 1 Year<br/>IDO Benefit: Guaranteed allocation]
    
    G --> J[Confirm Stake Amount ≥ 50K]
    H --> K[Confirm Stake Amount ≥ 150K]
    I --> L[Confirm Stake Amount ≥ 350K]
    
    J --> M[Execute Stake Transaction]
    K --> M
    L --> M
    
    M --> N{Transaction Successful?}
    N -->|No| O[Show Transaction Error]
    N -->|Yes| P[$KPAD Locked for 1 Year]
    
    P --> Q[User Added to Tier Pool]
    Q --> R[Start 1 Year Lockup Timer]
    R --> S[Update User Dashboard]
    
    S --> T{IDO Launch Event}
    T --> U[IDO Allocation Process]
    U --> V{Tier-Based Allocation}
    
    V -->|Node Pool| W[Random Draw<br/>10 winners from Node stakers<br/>Odds = 10/total_node_stakers]
    V -->|Cluster Pool| X[Random Draw<br/>25 winners from Cluster stakers<br/>Odds = 25/total_cluster_stakers]
    V -->|Chainweb Pool| Y[Guaranteed Allocation<br/>Equal division among all Chainweb stakers<br/>+ Private/Seed Round Access]
    
    W --> Z[Notify Selected Winners]
    X --> Z
    Y --> AA[Notify All Chainweb Members<br/>+ Private Channel Access]
    
    AA --> BB[IDO Participation Available]
    Z --> BB
    
    BB --> CC[1 Year Lockup Active]
    CC --> DD{Lockup Period Complete?}
    DD -->|No| EE[Tokens Remain Locked<br/>Cannot Withdraw]
    DD -->|Yes| FF[Unstaking Available]
    
    EE --> GG{Next IDO Launch?}
    GG -->|Yes| T
    GG -->|No| DD
    
    FF --> HH{User Wants to Unstake?}
    HH -->|No| II[Continue Staking<br/>Maintain IDO Eligibility]
    HH -->|Yes| JJ[Execute Unstake]
    
    II --> GG
    JJ --> KK[Return $KPAD to User Wallet]
    KK --> LL[Remove from All Tier Pools]
    LL --> MM[Lose IDO Eligibility]
    MM --> NN[End Staking]
    
    style G fill:#8B4513,color:#fff
    style H fill:#C0C0C0,color:#000
    style I fill:#FFD700,color:#000
    style W fill:#8B4513,color:#fff
    style X fill:#C0C0C0,color:#000
    style Y fill:#FFD700,color:#000
    style AA fill:#FFD700,color:#000