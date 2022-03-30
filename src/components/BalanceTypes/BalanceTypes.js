import React, { useEffect, useState } from 'react';
import './BalanceTypes.css';
import FeatherIcon from 'feather-icons-react';
import httpProvider from './../../providers/httpProvider';
import { BASE_URL } from './../../common/constants';
import Error from '../Base/Error/Error';
import Button from 'react-bootstrap/esm/Button';
import Loader from './../Base/Loader/Loader';

const BalanceTypes = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [toggleEditType, setToggleEditType] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [typeToEdit, setTypeToEdit] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await httpProvider
        .get(`${BASE_URL}/balance-types`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setTypes(data);
          }
        })
        .catch((error) => setError(error.toString()));
      setLoading(false);
    };
    fetchData();
  }, []);

  const addType = async () => {
    setLoading2(true);

    await httpProvider
      .post(`${BASE_URL}/balance-types`, { name: newType })
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setTypes((prev) => [...prev, { name: newType, _id: data?._id }]);
          setNewType('');
        }
      })
      .catch((error) => setError(error.toString()));
    setLoading2(false);
  };

  const deleteType = async (type_name, id) => {
    setLoading2(true);

    let balances = [];
    let warningText = '';

    await httpProvider.get(`${BASE_URL}/balances?type_id=${id}`).then((data) => (balances = data));

    if (balances.length > 0) {
      warningText = `You currently have ${
        balances.length
      } balances associated with it and they will also be deleted:
        ${balances.map((b) => `${b.description} - ${b.currency} ${b.amount} | `)}`;
    }

    if (
      window.confirm(`Are you sure you want to delete balance type ${type_name}? ${warningText}`)
    ) {
      await httpProvider
        .deleteReq(`${BASE_URL}/balance-types/${id}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setTypes((prev) => prev.filter((c) => c.name !== type_name));
          }
        })
        .catch((error) => setError(error.toString()));
      setLoading2(false);
    } else {
      setLoading2(false);
      return;
    }
  };

  const editType = async () => {
    setLoading2(true);
    await httpProvider
      .put(`${BASE_URL}/balance-types/${selectedType}`, {
        edited_type: typeToEdit,
      })
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setTypes((prev) => {
            return prev.map((type) => {
              if (type._id === selectedType) {
                return { ...type, name: typeToEdit };
              } else {
                return type;
              }
            });
          });
          setTypeToEdit('');
          setToggleEditType(false);
          setSelectedType(null);
        }
      })
      .catch((error) => setError(error.toString()));
    setLoading2(false);
  };

  return (
    <div className='balance-types-container'>
      {error && <Error error={error} setError={setError} />}
      <h3>Balance Types</h3>
      <input
        value={newType}
        onChange={(e) => setNewType(e.target.value)}
        type='text'
        placeholder='New Balance Type...'
        style={{ marginBottom: '10px' }}
      />{' '}
      <Button onClick={() => addType()}>Add New Balance Type</Button>
      {loading2 ? (
        <Loader height={'3.5em'} width={'2.5em'} />
      ) : (
        <div>
          <br />
        </div>
      )}
      {loading ? (
        <Loader />
      ) : (
        <div className='individual-balance-types'>
          {types?.map((type) => {
            return (
              <div className='individual-balance-type' key={type._id}>
                {toggleEditType && selectedType === type._id ? (
                  <>
                    <br />
                    <input
                      type='text'
                      value={typeToEdit}
                      onChange={(e) => setTypeToEdit(e.target.value)}
                    />
                    <br />
                    <Button variant='outline-primary' onClick={() => editType()}>
                      Save
                    </Button>
                    <Button
                      variant='outline-secondary'
                      onClick={() =>
                        setTypeToEdit(type.name) + setToggleEditType(false) + setSelectedType(null)
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  type.name
                )}{' '}
                <span>
                  <FeatherIcon
                    icon='edit'
                    size='15px'
                    className='feather-icons-edit-delete'
                    onClick={() =>
                      setToggleEditType(true) + setSelectedType(type._id) + setTypeToEdit(type.name)
                    }
                  />
                  <FeatherIcon
                    icon='trash-2'
                    className='feather-icons-edit-delete'
                    size='15px'
                    onClick={() => deleteType(type.name, type._id)}
                  />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BalanceTypes;
