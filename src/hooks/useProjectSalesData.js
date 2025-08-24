import { useState, useEffect, useCallback, useRef } from 'react';
import { pactCalls } from '../pactcalls/kadena';
import config from '../wallet/config';

/**
 * Hook to fetch real-time sales data for projects with debouncing and selective updates
 */
export const useProjectSalesData = (projects) => {
  const [projectsWithSalesData, setProjectsWithSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const debounceTimeouts = useRef(new Map());
  const lastDataRef = useRef(new Map());

  // Debounce function to avoid excessive updates
  const debounceUpdate = useCallback((projectId, updateFn, delay = 1000) => {
    if (debounceTimeouts.current.has(projectId)) {
      clearTimeout(debounceTimeouts.current.get(projectId));
    }

    const timeoutId = setTimeout(() => {
      updateFn();
      debounceTimeouts.current.delete(projectId);
    }, delay);

    debounceTimeouts.current.set(projectId, timeoutId);
  }, []);

  // Compare if data has actually changed
  const hasDataChanged = useCallback((projectId, newData) => {
    const lastData = lastDataRef.current.get(projectId);
    if (!lastData) return true;

    const currentSold = newData.salesDetails?.counters?.sold || 0;
    const lastSold = lastData.salesDetails?.counters?.sold || 0;
    
    const currentPrice = newData.salesDetails?.currentPrice || 0;
    const lastPrice = lastData.salesDetails?.currentPrice || 0;
    
    const currentPhase = newData.salesDetails?.currentPhase || '';
    const lastPhase = lastData.salesDetails?.currentPhase || '';

    return currentSold !== lastSold || currentPrice !== lastPrice || currentPhase !== lastPhase;
  }, []);

  const fetchSalesDataForProject = useCallback(async (project) => {
    if (!project.namespace || !project.moduleName) {
      return project;
    }

    try {
      const chain = config.chainId;
      const salesModuleName = `${project.moduleName}-sales`;
      const projectId = `${project.namespace}.${project.moduleName}`;

      // Fetch all sales data and token details in just 2 efficient calls
      const salesDataPromises = [
        // Get all sales data in one call using the consolidated object
        pactCalls(`(use ${project.namespace}.${salesModuleName}) {
          "free-sales": (available-for-free-sales), 
          "current-phase": (current-phase), 
          "price": (get-price), 
          "phase0": PHASE-0-START, 
          "phase1": PHASE-1-START, 
          "end": END-OF-PRESALES, 
          "escrow": SALES-ACCOUNT,
          "batches": TOTAL-BATCHES,
          "batch-size": AMOUNT-PER-BATCH,
          "reserveable": P0-RESERVED,
          "remaining": (- TOTAL-BATCHES (at 'sold (get-counters))),
          "sold": (at 'sold (get-counters)),
          "p0-price": (get-p0-price),
          "p1-price": (get-p1-price)
        }`, chain).catch(() => ({ result: { data: {} } })),
        
        // Get token details (includes imageUrl and symbol)
        pactCalls(`(use ${project.namespace}.${project.moduleName}) DETAILS`, chain).catch(() => ({ result: { data: {} } })),
      ];

      const [
        salesDataResult,
        tokenDetailsResult
      ] = await Promise.all(salesDataPromises);

      // Extract sales data from the consolidated response
      const salesData = salesDataResult.result?.data || {};
      const batchesSold = salesData.sold?.int || salesData.sold?.decimal || salesData.sold || 0;
      const amountPerBatch = salesData["batch-size"]?.decimal || salesData["batch-size"]?.int || salesData["batch-size"] || 0;
      const totalBatches = salesData.batches?.int || salesData.batches?.decimal || salesData.batches || 0;
      const p0Price = salesData["p0-price"]?.decimal || salesData["p0-price"]?.int || salesData["p0-price"];
      const p1Price = salesData["p1-price"]?.decimal || salesData["p1-price"]?.int || salesData["p1-price"];
      const currentPrice = salesData.price?.decimal || salesData.price?.int || salesData.price;
      const currentPhase = salesData["current-phase"];
      const remaining = salesData.remaining?.int || salesData.remaining?.decimal || salesData.remaining || 0;
      
      // Calculate actual tokens sold: batches * amount per batch
      const soldTokens = batchesSold * amountPerBatch;
      
      // Extract token details (consistent with presale store)
      const tokenDetails = tokenDetailsResult.result?.data || {};
      const tokenSymbol = tokenDetails.symbol ? tokenDetails.symbol.toUpperCase() : project.tokenDetails?.symbol;
      const imageUrl = tokenDetails.imageUrl || project.tokenDetails?.imageUrl || project.tokendetails?.imageUrl;
      const totalSupply = tokenDetails.supply?.int || tokenDetails.supply?.decimal || tokenDetails.supply || project.tokenDetails?.totalSupply || project.tokendetails?.totalSupply;

      // Debug logging for token details
    //   console.log(`Token details for ${project.moduleName}:`, {
    //     tokenDetailsFromBlockchain: tokenDetails,
    //     extractedSymbol: tokenSymbol,
    //     extractedImageUrl: imageUrl,
    //     projectTokenDetails: project.tokenDetails,
    //     projectTokendetails: project.tokendetails
    //   });

      // Extract phase timings
      const phase0StartTime = salesData.phase0?.time ? new Date(salesData.phase0.time) : null;
      const phase1StartTime = salesData.phase1?.time ? new Date(salesData.phase1.time) : null;
      const salesEndTime = salesData.end?.time ? new Date(salesData.end.time) : null;

      // Determine current phase and price based on time if phase is not available from contract
      const now = new Date();
      let finalCurrentPrice = currentPrice || p0Price; // Use contract's current price or fallback to p0
      let finalCurrentPhase = currentPhase || 'pre-sale';

      // If contract doesn't provide current phase, calculate it from timings
      if (!currentPhase && phase0StartTime && phase1StartTime && salesEndTime) {
        if (now < phase0StartTime) {
          finalCurrentPhase = 'pre-sale';
          finalCurrentPrice = p0Price;
        } else if (now >= phase0StartTime && now < phase1StartTime) {
          finalCurrentPhase = 'phase-0';
          finalCurrentPrice = p0Price;
        } else if (now >= phase1StartTime && now < salesEndTime) {
          finalCurrentPhase = 'phase-1';
          finalCurrentPrice = p1Price;
        } else if (now >= salesEndTime) {
          finalCurrentPhase = 'ended';
          finalCurrentPrice = p1Price; // Show phase 1 price when sale ended
        }
      }

      const updatedProject = {
        ...project,
        tokenDetails: {
          ...project.tokenDetails,
          symbol: tokenSymbol || project.tokenDetails?.symbol,
          SYMBOL: tokenSymbol || project.tokenDetails?.SYMBOL,
          imageUrl: imageUrl || project.tokenDetails?.imageUrl,
          totalSupply: totalSupply,
        },
        salesDetails: {
          ...project.salesDetails,
          counters: {
            ...project.salesDetails?.counters,
            sold: soldTokens,
            batchesSold: batchesSold,
            totalSales: soldTokens, // Keep same as sold for compatibility
            remaining: remaining,
          },
          phase0Price: p0Price || project.salesDetails?.phase0Price,
          phase1Price: p1Price || project.salesDetails?.phase1Price,
          currentPrice: finalCurrentPrice || project.salesDetails?.phase0Price || project.salesDetails?.phase0price,
          phase0StartDate: phase0StartTime?.toISOString() || project.salesDetails?.phase0StartDate,
          phase1StartDate: phase1StartTime?.toISOString() || project.salesDetails?.phase1StartDate,
          salesEndDate: salesEndTime?.toISOString() || project.salesDetails?.salesEndDate,
          currentPhase: finalCurrentPhase,
          // Always include project but mark data completeness
          hasCompleteData: !!(tokenSymbol && (p0Price !== null && p0Price !== undefined) && finalCurrentPrice),
          // Include calculated totals for consistency
          presalesAmount: (project.salesDetails?.presalesAmount || 
                          (totalBatches * amountPerBatch) ||
                          project.salesDetails?.totalTokensToSale),
          totalBatches: totalBatches || project.salesDetails?.totalBatches || Math.ceil((project.salesDetails?.presalesAmount || project.salesDetails?.totalTokensToSale || 0) / (amountPerBatch || 1)) || 0,
          amountPerBatch: amountPerBatch || project.salesDetails?.amountPerBatch || project.salesDetails?.tokensPerBatch,
          // Add new data from the consolidated call
          remainingBatches: remaining,
          availableForFreeSales: salesData["free-sales"]?.int || salesData["free-sales"]?.decimal || salesData["free-sales"] || 0,
          salesAccount: salesData.escrow || project.salesDetails?.salesAccount,
          p0Reserved: salesData.reserveable?.int || salesData.reserveable?.decimal || salesData.reserveable || project.salesDetails?.p0Reserved,
        }
      };

      // Store the data for comparison in future updates
      lastDataRef.current.set(projectId, updatedProject);

      return updatedProject;
    } catch (error) {
      console.error(`Error fetching sales data for ${project.moduleName}:`, error);
      return project; // Return original project if fetch fails
    }
  }, []);

  // Update a single project with debouncing
  const updateSingleProject = useCallback(async (project) => {
    const projectId = `${project.namespace}.${project.moduleName}`;
    
    try {
      const updatedProject = await fetchSalesDataForProject(project);
      
      // Only update if data has actually changed
      if (hasDataChanged(projectId, updatedProject)) {
        debounceUpdate(projectId, () => {
          setProjectsWithSalesData(prevProjects => 
            prevProjects.map(p => 
              `${p.namespace}.${p.moduleName}` === projectId ? updatedProject : p
            )
          );
        });
      }
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
    }
  }, [debounceUpdate, hasDataChanged, fetchSalesDataForProject]);

  // Initial load of all projects
  const initialLoad = useCallback(async () => {
    if (!projects || projects.length === 0) {
      setProjectsWithSalesData([]);
      setInitialLoadComplete(true);
      return;
    }

    setLoading(true);
    try {
      // Fetch all projects initially
      const projectsWithData = await Promise.all(
        projects.map(project => fetchSalesDataForProject(project))
      );
      
      // Include all projects - let the UI handle rendering decisions
      setProjectsWithSalesData(projectsWithData);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Error in initial load:', error);
      setProjectsWithSalesData(projects); // Fallback to original data
    } finally {
      setLoading(false);
    }
  }, [projects, fetchSalesDataForProject]);

  // Periodic updates for individual projects
  const startPeriodicUpdates = useCallback(() => {
    if (!initialLoadComplete || !projects || projects.length === 0) return;

    const updateIntervals = new Map();

    projects.forEach((project, index) => {
      // Stagger updates to avoid hitting the blockchain all at once
      const delay = index * 2000; // 2 seconds apart
      
      const intervalId = setInterval(() => {
        updateSingleProject(project);
      }, 30000); // Update every 30 seconds

      // Initial staggered update
      setTimeout(() => {
        updateSingleProject(project);
      }, delay);

      updateIntervals.set(`${project.namespace}.${project.moduleName}`, intervalId);
    });

    return () => {
      updateIntervals.forEach(intervalId => clearInterval(intervalId));
    };
  }, [projects, initialLoadComplete, updateSingleProject]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  useEffect(() => {
    const cleanup = startPeriodicUpdates();
    return cleanup;
  }, [startPeriodicUpdates]);

  const manualRefetch = async () => {
    if (!projects || projects.length === 0) {
      setProjectsWithSalesData([]);
      return;
    }

    setLoading(true);
    try {
      const projectsWithData = await Promise.all(
        projects.map(project => fetchSalesDataForProject(project))
      );
      
      setProjectsWithSalesData(projectsWithData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setProjectsWithSalesData(projects);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects: projectsWithSalesData,
    loading,
    refetch: manualRefetch
  };
};
