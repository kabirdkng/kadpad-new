import React from 'react';
import { Coins } from 'lucide-react';

const CreateTokenStep = () => (
  <div className="text-center">
    <Coins className="w-16 h-16 text-lime-500 mx-auto mb-6" />
    <h2 className="text-2xl font-bold mb-4">Create Your Token</h2>
    <p className="mb-6">Head to TokenGo to create a token. Ensure that you create a presale contract and set the start of the Phase 0 Sale for at least two weeks from now.</p>
    <a href="https://tokengo.fun" target="_blank" rel="noopener noreferrer" className="w-1/4 bg-lime-500 hover:bg-lime-600 text-white font-bold mr-4 py-2 px-2 rounded transition duration-300">
      TokenGo
    </a>
    <a href="https://kadenai-docs.readthedocs.io/en/latest/ide/index.html" target="_blank" rel="noopener noreferrer" className="w-1/4 bg-lime-500 hover:bg-lime-600 text-white font-bold ml-1 py-2 px-6 rounded transition duration-300">
      Docs
    </a>
  </div>
);

export default CreateTokenStep;