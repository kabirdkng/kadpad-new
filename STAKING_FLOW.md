# Kadpad Staking Contract Flow Diagram

This document outlines the complete flow for the Kadpad staking system on Kadena blockchain.

## Overview

Kadpad's staking system rewards long-term commitment with exclusive IDO access. Users must stake $KPAD tokens for exactly 1 year to participate in Initial DEX Offerings (IDOs) across three distinct tiers.

## Staking Tiers

| Tier | Token Requirement | Lockup Period | IDO Allocation Benefit |
|------|------------------|---------------|------------------------|
| 🟤 **Node** | 50,000 $KPAD | 1 Year | 10 random allocation spots per IDO |
| 🥈 **Cluster** | 150,000 $KPAD | 1 Year | 25 random allocation spots per IDO |
| 🥇 **Chainweb** | 350,000 $KPAD | 1 Year | **Guaranteed allocation** + Premium perks |

## Penalty Mechanism

**Early Unstaking Penalty**: Linear reduction from 50% to 0% over the 1-year (365 days) lockup period

| Time Period | Penalty | User Receives | Example Calculation |
|-------------|---------|---------------|-------------------|
| Day 1 | 50.00% penalty | 50.00% of staked amount | 100K → 50K received |
| Day 30 | 45.89% penalty | 54.11% of staked amount | 100K → 54.1K received |
| Day 90 | 37.67% penalty | 62.33% of staked amount | 100K → 62.3K received |
| Day 180 | 25.34% penalty | 74.66% of staked amount | 100K → 74.7K received |
| Day 270 | 13.01% penalty | 86.99% of staked amount | 100K → 87K received |
| Day 360 | 1.37% penalty | 98.63% of staked amount | 100K → 98.6K received |
| Day 365+ | 0.00% penalty | 100.00% of staked amount | 100K → 100K received |

**Daily Formula**: `Penalty% = 50% × (1 - days_staked/365)`  
**Daily Reduction**: `~0.137%` penalty decrease per day

## Staking Flow Diagram

```mermaid
flowchart TD
    A["🔗 User Connects Wallet"] --> B["💰 Check $KPAD Balance"]
    B --> C{"Has Sufficient $KPAD?"}
    C -->|❌ No| D["⚠️ Show Insufficient Balance Error"]
    C -->|✅ Yes| E["🎯 Select Staking Tier"]
    
    E --> F{"Choose Tier"}
    F -->|Node| G["🟤 Node Tier<br/>Min: 50,000 $KPAD<br/>Lockup: 1 Year<br/>IDO: 10 random allocations"]
    F -->|Cluster| H["🥈 Cluster Tier<br/>Min: 150,000 $KPAD<br/>Lockup: 1 Year<br/>IDO: 25 random allocations"]
    F -->|Chainweb| I["🥇 Chainweb Tier<br/>Min: 350,000 $KPAD<br/>Lockup: 1 Year<br/>IDO: Guaranteed allocation"]
    
    G --> J["✅ Confirm Stake Amount ≥ 50K"]
    H --> K["✅ Confirm Stake Amount ≥ 150K"]
    I --> L["✅ Confirm Stake Amount ≥ 350K"]
    
    J --> M["📝 Execute Stake Transaction"]
    K --> M
    L --> M
    
    M --> N{"Transaction Successful?"}
    N -->|❌ No| O["🚫 Show Transaction Error"]
    N -->|✅ Yes| P["🔒 $KPAD Locked for 1 Year"]
    
    P --> Q["👥 User Added to Tier Pool"]
    Q --> R["⏰ Start 1 Year Lockup Timer"]
    R --> S["📊 Update User Dashboard"]
    
    S --> T{"🚀 IDO Launch Event"}
    T --> U["🎲 IDO Allocation Process"]
    U --> V{"Tier-Based Allocation"}
    
    V -->|Node Pool| W["🎯 Random Draw<br/>10 winners from Node stakers<br/>Odds = 10/total_node_stakers"]
    V -->|Cluster Pool| X["🎯 Random Draw<br/>25 winners from Cluster stakers<br/>Odds = 25/total_cluster_stakers"]
    V -->|Chainweb Pool| Y["⭐ Guaranteed Allocation<br/>Equal division among all Chainweb stakers<br/>+ Private/Seed Round Access"]
    
    W --> Z["📧 Notify Selected Winners"]
    X --> Z
    Y --> AA["🎉 Notify All Chainweb Members<br/>+ Private Channel Access"]
    
    AA --> BB["💎 IDO Participation Available"]
    Z --> BB
    
    BB --> CC["🔒 1 Year Lockup Active"]
    CC --> DD{"Lockup Period Complete?"}
    DD -->|❌ No| EE["⏳ Tokens Remain Locked<br/>⚠️ Early Unstaking Available with Penalty"]
    DD -->|✅ Yes| FF["🔓 Unstaking Available (No Penalty)"]
    
    EE --> GG{"Next IDO Launch?"}
    EE --> PPP{"User Wants Early Unstake?"}
    
    PPP -->|❌ No| GG
    PPP -->|✅ Yes| QQQ["📊 Calculate Current Penalty"]
    
    QQQ -->     RRR["💸 Show Daily Penalty Calculation<br/>Penalty% = 50% × (1 - days_staked/365)<br/>Daily Reduction: ~0.137% per day<br/>Current Penalty: X.XX%<br/>User Receives: staked_amount × (1 - penalty%)"]
    
    RRR --> SSS{"Confirm Early Unstake?"}
    SSS -->|❌ No| GG
    SSS -->|✅ Yes| TTT["📤 Execute Early Unstake"]
    
    TTT --> UUU["🔥 Burn Penalty Amount"]
    UUU --> VVV["💰 Return Remaining $KPAD to User"]
    VVV --> WWW["❌ Remove from All Tier Pools"]
    WWW --> XXX["🚫 Lose IDO Eligibility"]
    XXX --> YYY["🏁 End Staking (Penalty Applied)"]
    
    GG -->|✅ Yes| T
    GG -->|❌ No| DD
    
    FF --> HH{"User Wants to Unstake?"}
    HH -->|❌ No| II["🔄 Continue Staking<br/>Maintain IDO Eligibility"]
    HH -->|✅ Yes| JJ["📤 Execute Unstake (No Penalty)"]
    
    II --> GG
    JJ --> KK["💰 Return 100% $KPAD to User Wallet"]
    KK --> LL["❌ Remove from All Tier Pools"]
    LL --> MM["🚫 Lose IDO Eligibility"]
    MM --> NN["🏁 End Staking"]
    
    style G fill:#8B4513,color:#fff,stroke:#5D2F0A,stroke-width:2px
    style H fill:#C0C0C0,color:#000,stroke:#808080,stroke-width:2px
    style I fill:#FFD700,color:#000,stroke:#B8860B,stroke-width:2px
    style W fill:#8B4513,color:#fff,stroke:#5D2F0A,stroke-width:2px
    style X fill:#C0C0C0,color:#000,stroke:#808080,stroke-width:2px
    style Y fill:#FFD700,color:#000,stroke:#B8860B,stroke-width:2px
    style AA fill:#FFD700,color:#000,stroke:#B8860B,stroke-width:2px
    style RRR fill:#FF6B6B,color:#fff,stroke:#E55555,stroke-width:2px
    style UUU fill:#FF6B6B,color:#fff,stroke:#E55555,stroke-width:2px
    
    classDef errorClass fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#000
    classDef successClass fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000
    classDef processClass fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef penaltyClass fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    
    class D,O,XXX,MM errorClass
    class P,BB,KK,VVV successClass
    class M,U,JJ,TTT processClass
    class QQQ,RRR,SSS,UUU penaltyClass
```

## Key Features Explained

### 🔐 Core Mechanics
- **IDO Eligibility**: Only users who have staked $KPAD tokens can participate in IDO launches
- **Mandatory 1-Year Lock-up**: All staked tokens are locked for exactly 365 days with no early withdrawal option
- **Early Unstaking Option**: Users can unstake early but face linear penalty reduction
- **Multi-IDO Participation**: Stakers remain eligible for all IDO launches during their lockup period
- **Tier-Based Benefits**: Higher tiers provide better allocation opportunities

### 🎲 Allocation System
- **Node & Cluster Tiers**: Fair random lottery system with transparent odds calculation
- **Chainweb Tier**: Guaranteed participation in every IDO launch
- **Equal Treatment**: All users within the same tier have equal chances/allocations
- **Transparent Process**: Random selection algorithms are verifiable and fair

### 💸 Penalty Mechanism Details
- **Daily Linear Reduction**: Penalty decreases from 50% to 0% over 365 days
- **Daily Calculation**: Penalty amount updates every day (24-hour periods)
- **Daily Reduction Rate**: Approximately 0.137% penalty decrease per day
- **Precise Formula**: `Penalty% = 50% × (1 - days_staked/365)`
- **Token Burning**: Penalty tokens are permanently removed from circulation
- **Immediate Effect**: Early unstaking removes user from all tier pools and IDO eligibility
- **Real-time Updates**: Dashboard shows current penalty percentage and receivable amount

### 💎 Chainweb Premium Benefits
- **Guaranteed IDO Access**: Never miss an opportunity
- **Private/Seed Rounds**: Early access to exclusive investment rounds
- **Direct Team Communication**: Private channel access with the Kadpad team
- **Priority Support**: Enhanced customer support and assistance

### 📊 Technical Implementation
- **Smart Contract Security**: Built on Kadena's secure blockchain infrastructure
- **Automated Processes**: Lockup periods and allocations handled automatically
- **Pool Segregation**: Each tier operates independently to ensure fairness
- **Real-time Tracking**: Live dashboard updates for staking status and rewards

## How to Use This System

### Step 1: Preparation
1. Ensure you have a compatible Kadena wallet (Linx, X-Wallet, Koala)
2. Acquire sufficient $KPAD tokens for your desired tier
3. Connect your wallet to the Kadpad platform

### Step 2: Staking Process
1. **Select Tier**: Choose Node (50K), Cluster (150K), or Chainweb (350K)
2. **Confirm Amount**: Verify you meet the minimum requirement
3. **Execute Transaction**: Sign the staking transaction
4. **Wait for Confirmation**: Your tokens will be locked for 1 year

### Step 3: IDO Participation
1. **Monitor Launches**: Watch for new IDO announcements
2. **Check Eligibility**: Verify your tier status and allocation chances
3. **Participate**: Join IDOs based on your tier benefits
4. **Track Results**: Monitor allocation results and participation status

### Step 4: Post-Lockup Options
1. **Wait for Full Term**: Complete 1-year lockup for no penalty
2. **Early Unstaking**: Option available with penalty (50% reducing to 0%)
3. **Continue Staking**: Keep staking to retain IDO eligibility after lockup expires

## Important Notes

⚠️ **Daily Early Unstaking Penalty**: 50% penalty reducing by ~0.137% each day over 365 days  
📈 **Compound Benefits**: Participating in multiple IDOs during lockup maximizes value  
🔄 **Continuous Eligibility**: Stakers can participate in all IDOs launched during their lockup  
⭐ **Tier Advantages**: Higher tiers provide significantly better allocation opportunities  
🔥 **Token Burning**: Penalty tokens are permanently removed from circulation  

## Support & Resources

- **Documentation**: [Complete Kadpad Docs](https://docs.kadpad.xyz)
- **Community**: [Discord Server](https://discord.gg/xe5PTEUeDE)  
- **Updates**: [Twitter @kadpad_official](https://twitter.com/kadpad_official)
- **Support**: support@kadpad.xyz

---

*This staking system is designed to reward long-term commitment to the Kadpad ecosystem while ensuring fair and transparent access to high-quality IDO opportunities on Kadena.*
