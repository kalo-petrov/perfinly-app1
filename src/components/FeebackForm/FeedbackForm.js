import React from 'react';
import './FeedbackForm.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import StarRating from './StarRating';
import httpProvider from './../../providers/httpProvider';
import { BASE_URL } from './../../common/constants';
import Loader from '../Base/Loader/Loader';

const FeedbackForm = () => {
  const [existingFeedback, setExistingFeedback] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [rating, setRating] = React.useState(0);
  const [feedback1, setFeedback1] = React.useState('');
  const [feedback2, setFeedback2] = React.useState('');
  const [feedback3, setFeedback3] = React.useState('');
  const [feedback4, setFeedback4] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      httpProvider.get(`${BASE_URL}/feedback`).then((data) => {
        if (data.error) {
          setLoading(false);
          return;
        } else {
          setExistingFeedback(true);
          setTitle(data.title);
          setRating(data.rating);
          setFeedback1(data.feedback[0]);
          setFeedback2(data.feedback[1]);
          setFeedback3(data.feedback[2]);
          setFeedback4(data.feedback[3]);
        }
        setLoading(false);
      });

    };
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const feedbackObject = {
      title,
      rating,
      feedback: [feedback1, feedback2, feedback3, feedback4],
    };

    existingFeedback
      ? httpProvider
          .put(`${BASE_URL}/feedback`, feedbackObject)
          .then((data) => console.log(data))
          .catch((e) => console.error(e))
      : httpProvider
          .post(`${BASE_URL}/feedback`, feedbackObject)
          .then((data) => console.log(data))
          .catch((e) => console.error(e));
  };

  
  if (loading) {
    return (
      <Loader/>
    );
  }

  return (
    <div>
      <h3>{existingFeedback ? 'Edit Your Feedback' : 'Give us Feeback'}</h3>
      <div className='feedback-form-container'>
        <Form>
          <Form.Group className='mb-3'>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type='text'
              placeholder='Give Your Feeback a Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>
              <div> Rating: {rating}/10 </div>
              <div>
                <StarRating rating={rating} setRating={setRating} />
              </div>
            </Form.Label>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>General Feeback</Form.Label>
            <Form.Control
              value={feedback1}
              onChange={(e) => setFeedback1(e.target.value)}
              as='textarea'
              rows={3}
              type='text'
              placeholder='Tell us about your experience with the app'
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>What did you like most about the app?</Form.Label>
            <Form.Control
              value={feedback2}
              onChange={(e) => setFeedback2(e.target.value)}
              as='textarea'
              rows={3}
              type='text'
              placeholder='Tell us about the features you liked the most'
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>
              What did you not like about the app? Anything you think is missing? What is not
              working?
            </Form.Label>
            <Form.Control
              value={feedback3}
              onChange={(e) => setFeedback3(e.target.value)}
              as='textarea'
              rows={3}
              type='text'
              placeholder='Tell us about what features are not working or any bugs you have seen'
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Anything Else?</Form.Label>
            <Form.Control
              value={feedback4}
              onChange={(e) => setFeedback4(e.target.value)}
              as='textarea'
              rows={3}
              type='text'
              placeholder='Anything else you would like to share about your experience with the app?'
            />
          </Form.Group>
          <Button type='submit' onClick={handleSubmit}>
            Submit Feedback
          </Button>
        </Form>
        <br />
        <br />
      </div>
    </div>
  );
};

export default FeedbackForm;
