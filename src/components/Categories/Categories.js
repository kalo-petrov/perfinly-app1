import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../common/constants';
import httpProvider from '../../providers/httpProvider';
import './Categories.css';
import FeatherIcon from 'feather-icons-react';
import Error from '../Base/Error/Error';
import Button from 'react-bootstrap/esm/Button';
import Loader from './../Base/Loader/Loader';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [toggleAddSubCat, setToggleAddSubCat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toggleEditCategory, setToggleEditCategory] = useState(false);
  const [categoryNameToEdit, setCategoryNameToEdit] = useState('');
  const [toggleEditSubcategory, setToggleEditSubcategory] = useState(false);
  const [selectedSubCategory, setSelectedSubcategory] = useState('');
  const [subcategoryNameToEdit, setSubcategoryNameToEdit] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      await httpProvider
        .get(`${BASE_URL}/spend-categories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setCategories(data);
          }
        })
        .catch((error) => setError(error.toString()));

      await httpProvider
        .get(`${BASE_URL}/spend-categories/1/all-subcategories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setSubcategories(data);
          }
        })
        .catch((error) => setError(error.toString()));
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const addCategory = async () => {
    setLoading2(true);
    await httpProvider
      .post(`${BASE_URL}/spend-categories`, { name: newCategory })
      .then((data) => {
        console.log(data);
        if (data.error) {
          setError(data.error.toString());
        } else {
          setCategories((prev) => [...prev, { name: newCategory, _id: data?._id }]);
          setNewCategory('');
        }
      })
      .catch((error) => setError(error.toString()));
    setLoading2(false);
  };

  const addSubcategory = async () => {
    setLoading2(true);
    await httpProvider
      .post(`${BASE_URL}/spend-categories/${selectedCategory}/subcategories`, {
        subcategory: newSubcategory,
      })
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setSubcategories((prev) => [...prev, ...data]);
          setNewSubcategory('');
          setSelectedCategory('');
          setToggleAddSubCat(false);
        }
      })
      .catch((error) => setError(error.toString()));
    setLoading2(false);
  };

  const editCategory = async () => {
    setLoading2(true);
    await httpProvider
      .put(`${BASE_URL}/spend-categories/${selectedCategory}`, {
        edited_category: categoryNameToEdit,
      })
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setCategories((prev) => {
            return prev.map((c) => {
              if (c._id === selectedCategory) {
                return { ...c, name: categoryNameToEdit };
              } else {
                return c;
              }
            });
          });
          setCategoryNameToEdit('');
          setToggleEditCategory(false);
          setSelectedCategory('');
        }
      })
      .catch((error) => setError(error.toString()));
    setLoading2(false);
  };

  const deleteCategory = async (category_name, id) => {
    setLoading2(true);
    let records = [];
    let warningText = '';

    await httpProvider
      .get(`${BASE_URL}/spending?category_id=${id}`)
      .then((data) => (records = data));

    if (records.length > 0) {
      warningText = `You currently have ${
        records.length
      } spend record associated with it and they will also be deleted:
        ${records.map(
          (r) => `${r.description} - ${r.currency} ${r.amount} (${r.date.slice(0, 10)}) | `
        )}`;
    }

    if (
      window.confirm(`Are you sure you want to delete category ${category_name}? ${warningText}`)
    ) {
      await httpProvider
        .deleteReq(`${BASE_URL}/spend-categories/${id}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setCategories((prev) => prev.filter((c) => c.name !== category_name));
          }
        })
        .catch((error) => setError(error.toString()));
    } else {
      setLoading2(false);
      return;
    }
    setLoading2(false);
  };

  const editSubcategory = async () => {
    setLoading2(true);
    await httpProvider
      .put(
        `${BASE_URL}/spend-categories/${selectedCategory}/subcategories/${selectedSubCategory}`,
        {
          edited_subcategory: subcategoryNameToEdit,
        }
      )
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setSubcategories((prev) => {
            return prev.map((sc) => {
              if (sc._id === selectedSubCategory) {
                return { ...sc, name: subcategoryNameToEdit };
              } else {
                return sc;
              }
            });
          });

          setSubcategoryNameToEdit('');
          setToggleEditSubcategory(false);
          setSelectedSubcategory('');
          setSelectedCategory('');
        }
      })
      .catch((error) => setError(error.toString()));
    setLoading2(false);
  };

  const deleteSubcategory = async (e, subcategory_name, category_id, subcat_id) => {
    e.preventDefault();
    setLoading2(true);

    let records = [];
    let warningText = '';

    await httpProvider
      .get(`${BASE_URL}/spending?category_id=${category_id}`)
      .then((data) => (records = data.filter((r) => r.subcategory_id === subcat_id)));

    if (records.length > 0) {
      warningText = `You currently have ${
        records.length
      } spend record associated with it and they will also be deleted:
        ${records.map(
          (r) => `${r.description} - ${r.currency} ${r.amount} (${r.date.slice(0, 10)})
          `
        )}`;
    }

    if (
      window.confirm(`Are you sure you want to delete category ${subcategory_name}? ${warningText}`)
    ) {
      await httpProvider
        .deleteReq(`${BASE_URL}/spend-categories/${category_id}/subcategories/${subcat_id}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setSubcategories((prev) => prev.filter((sc) => sc._id !== subcat_id));
          }
        })
        .catch((error) => setError(error.toString()));
    } else {
      setLoading2(false);
      return;
    }
    setLoading2(false);
  };

  return (
    <div className='categories-container'>
      {error && <Error error={error} setError={setError} />}
      <h3>Categories</h3>
      <input
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        type='text'
        placeholder='New Category...'
        style={{ lineHeight: '1.5' }}
        // style={{height: '35px'}}
      />{' '}
      <p></p>
      <Button onClick={() => addCategory()}>Add New Category</Button>
      {loading2 ? (
        <Loader height={'3.5em'} width={'2.5em'} />
      ) : (
        <div>
          <br />
        </div>
      )}
      <div className='categories-table-container'>
        {loading ? (
          <Loader />
        ) : (
          <table className='categories-table'>
            <thead>
              <tr>
                <th className='categories-row'>Categories</th>
                <th>Subcategories</th>
              </tr>
            </thead>

            <tbody>
              {categories?.map((cat) => {
                return (
                  <tr key={cat._id}>
                    <td className='categories-row'>
                      {toggleEditCategory && selectedCategory === cat._id ? (
                        <>
                          <input
                            type='text'
                            value={categoryNameToEdit}
                            className='categories-input'
                            onChange={(e) => setCategoryNameToEdit(e.target.value)}
                          />
                          <br />
                          <Button
                            className='bootstrap-buttons'
                            variant='outline-primary'
                            onClick={() => editCategory()}
                          >
                            Save
                          </Button>
                          <Button
                            variant='outline-secondary'
                            className='bootstrap-buttons'
                            onClick={() =>
                              setCategoryNameToEdit(cat.name) +
                              setToggleEditCategory(false) +
                              setSelectedCategory('')
                            }
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        cat.name
                      )}{' '}
                      <span>
                        <FeatherIcon
                          icon='edit'
                          size='15px'
                          color='#0d67dc'
                          className='feather-icons-edit-delete'
                          onClick={() =>
                            setToggleEditCategory(true) +
                            setSelectedCategory(cat._id) +
                            setCategoryNameToEdit(cat.name)
                          }
                        />
                        <FeatherIcon
                          icon='trash-2'
                          className='feather-icons-edit-delete'
                          size='15px'
                          color='#0d67dc'
                          onClick={() => deleteCategory(cat.name, cat._id)}
                        />
                      </span>
                    </td>
                    <td className='subcategories-cell'>
                      {subcategories?.map((sc, i) => {
                        if (sc?.category_id === cat._id) {
                          return (
                            <span key={sc._id}>
                              {toggleEditSubcategory &&
                              selectedSubCategory === sc._id &&
                              selectedCategory === cat._id ? (
                                <>
                                  <input
                                    type='text'
                                    value={subcategoryNameToEdit}
                                    className='categories-input'
                                    onChange={(e) => setSubcategoryNameToEdit(e.target.value)}
                                  />
                                  <Button
                                    className='bootstrap-buttons'
                                    variant='outline-primary'
                                    onClick={() => editSubcategory()}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    className='bootstrap-buttons'
                                    variant='outline-secondary'
                                    onClick={() =>
                                      setSelectedCategory('') +
                                      setToggleEditSubcategory(false) +
                                      setSelectedSubcategory('')
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <small className='single-subcategory' key={sc._id}>
                                  {sc.name}{' '}
                                  <FeatherIcon
                                    icon='edit-2'
                                    size='12px'
                                    color='#0d67dc'
                                    className='feather-icons-edit-delete'
                                    onClick={() =>
                                      setToggleEditSubcategory(true) +
                                      setSelectedCategory(cat._id) +
                                      setSelectedSubcategory(sc._id) +
                                      setSubcategoryNameToEdit(sc.name)
                                    }
                                  />{' '}
                                  <FeatherIcon
                                    icon='trash-2'
                                    size='12px'
                                    color='#0d67dc'
                                    className='feather-icons-edit-delete'
                                    onClick={(e) => deleteSubcategory(e, sc.name, cat._id, sc._id)}
                                  />
                                </small>
                              )}{' '}
                            </span>
                          );
                        } else {
                          return <span key={sc._id}></span>;
                        }
                      })}

                      <>
                        {(selectedCategory !== cat._id || !selectedCategory) && (
                          <Button
                            variant='outline-primary'
                            className='bootstrap-buttons'
                            onClick={() => setToggleAddSubCat(true) + setSelectedCategory(cat._id)}
                          >
                            +Add Subcategory
                          </Button>
                        )}

                        {toggleAddSubCat && selectedCategory === cat._id && (
                          <span>
                            <input
                              value={newSubcategory}
                              onChange={(e) => setNewSubcategory(e.target.value)}
                              type='text'
                              className='categories-input'
                              placeholder='New Subcategory...'
                            />{' '}
                            <Button
                              className='bootstrap-buttons'
                              variant='outline-primary'
                              onClick={() => addSubcategory()}
                            >
                              Add
                            </Button>{' '}
                            <Button
                              className='bootstrap-buttons'
                              variant='outline-secondary'
                              onClick={() => setToggleAddSubCat(false) + setSelectedCategory('')}
                            >
                              Cancel
                            </Button>
                          </span>
                        )}
                      </>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Categories;
