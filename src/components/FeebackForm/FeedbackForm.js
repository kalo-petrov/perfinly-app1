import React, { useContext } from 'react';
import './FeedbackForm.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import StarRating from './StarRating';
import httpProvider from './../../providers/httpProvider';
import { BASE_URL } from './../../common/constants';
import Loader from '../Base/Loader/Loader';
import { useHistory } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const FeedbackForm = (props) => {
  const [existingFeedback, setExistingFeedback] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [rating, setRating] = React.useState(1);
  const [usage, setUsage] = React.useState(1);
  const [financialHabits, setFinancialHabits] = React.useState(1);
  const [intuitiveUse, setIntuitiveUse] = React.useState(1);
  const [careAboutDesign, setCareAboutDesign] = React.useState(1);
  const [design, setDesign] = React.useState(1);
  const [recommend, setRecommend] = React.useState(1);

  const [feedback1, setFeedback1] = React.useState('');
  const [feedback2, setFeedback2] = React.useState('');
  const [feedback3, setFeedback3] = React.useState('');
  const [feedback4, setFeedback4] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await httpProvider.get(`${BASE_URL}/feedback`).then((data) => {
        if (data.error) {
          setLoading(false);
          return;
        } else {
          setExistingFeedback(true);
        }
        setLoading(false);
      });
    };
    fetchData();
  }, []);

  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const feedbackObject = {
      title,
      rating,
      usage,
      financialHabits,
      intuitiveUse,
      careAboutDesign,
      design,
      recommend,
      feedback: [feedback1, feedback2, feedback3, feedback4],
      username: user.username,
      email: user.email,
    };

    await httpProvider
      .post(`${BASE_URL}/feedback`, feedbackObject)
      .then((data) => alert(`Thank your for your feedback!`) + props.history.push('/dashboard'))
      .catch((e) => console.error(e));

    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (existingFeedback) {
    return (
      <div>
        <h4>You have already given us Feedback! Thank you! We Appreciate your time and effort!</h4>
      </div>
    );
  }
  return (
    <div>
      <h4>Thanks for using Perfinly! We would love to hear from you</h4>
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
          <hr />

          <h6>
            Please rate the following aspects of the app with 5 Stars to agree and 1 to disagree
          </h6>
          <br />
          <Form.Group className='mb-3'>
            <Form.Label>
              <div> Overall I enjoy using the application: ({rating}/5) </div>
              <div>
                <StarRating rating={rating} setRating={setRating} />
              </div>
            </Form.Label>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>
              <div> I would use such an app often ({usage}/5) </div>
              <div>
                <StarRating rating={usage} setRating={setUsage} />
              </div>
            </Form.Label>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>
              <div>
                {' '}
                Such an app would help me improve my financial habits ({financialHabits}/5){' '}
              </div>
              <div>
                <StarRating rating={financialHabits} setRating={setFinancialHabits} />
              </div>
            </Form.Label>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>
              <div> I find this app easy and intuitive to use ({intuitiveUse}/5) </div>
              <div>
                <StarRating rating={intuitiveUse} setRating={setIntuitiveUse} />
              </div>
            </Form.Label>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>
              <div> I care about the design of this app ({careAboutDesign}/5 )</div>
              <div>
                <StarRating rating={careAboutDesign} setRating={setCareAboutDesign} />
              </div>
            </Form.Label>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>
              <div> I like the design of this app ({design}/5) </div>
              <div>
                <StarRating rating={design} setRating={setDesign} />
              </div>
            </Form.Label>
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>
              <div> I would recommend this app to a friend ({recommend}/5) </div>
              <div>
                <StarRating rating={recommend} setRating={setRecommend} />
              </div>
            </Form.Label>
          </Form.Group>

          <hr />
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
