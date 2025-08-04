import { useParams } from 'react-router-dom';
import PresaleView from '../components/presale/PresaleView';

const Presale = () => {
  const { namespace, moduleName } = useParams();

  return (
    <PresaleView 
      namespace={namespace} 
      moduleName={moduleName} 
    />
  );
};

export default Presale;
