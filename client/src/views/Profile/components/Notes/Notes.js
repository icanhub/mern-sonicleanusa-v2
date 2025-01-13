import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveNotes,
  fetchNotes,
  deleteNoteRequest,
  putNote,
} from '../../../../reducers/Users';
import {
  saveOrderNotes,
  fetchOrderNotes,
  deleteOrderNoteRequest,
  putOrderNote,
} from '../../../../reducers/OrderHistory';
import { Table } from 'reactstrap';
import './notes.scss';

const Notes = props => {
  const accountData = useSelector(state => state.account.accountData);
  let notesList, addNotes, deleteNoteData, updatedNoteData;
  if (props.page === 'order') {
    notesList = useSelector(state => state.orderhistory.notesList);
    addNotes = useSelector(state => state.orderhistory.notesData);
    deleteNoteData = useSelector(state => state.orderhistory.deleteNoteData);
    updatedNoteData = useSelector(state => state.orderhistory.updatedNoteData);
  } else {
    notesList = useSelector(state => state.users.notesList);
    addNotes = useSelector(state => state.users.notesData);
    deleteNoteData = useSelector(state => state.users.deleteNoteData);
    updatedNoteData = useSelector(state => state.users.updatedNoteData);
  }
  const dispatch = useDispatch();
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [notes, setNotes] = useState([]);
  const [notesToDisplay, setNotesToDisplay] = useState([]);
  const [notesError, setNotesError] = useState([]);
  const [edit, setEdit] = useState([]);

  const handleAddNote = async () => {
    if (note) {
      props.page === 'order'
        ? await dispatch(saveOrderNotes({ note }, props.orderId))
        : await dispatch(saveNotes({ note }, accountData._id));
      setNote('');
      setNoteError('');
    } else {
      setNoteError('This field cannot be empty!');
    }
  };

  const handleDeleteNote = async (index, noteId) => {
    props.page === 'order'
      ? await dispatch(deleteOrderNoteRequest(noteId, props.orderId))
      : await dispatch(deleteNoteRequest(noteId, accountData._id));
    if (notesError[index]) {
      let temp = JSON.parse(JSON.stringify(notesError));
      temp.splice(index, 1);
      setNotesError(temp);
    }
  };

  const handleEditNote = async index => {
    let temp = JSON.parse(JSON.stringify(edit));
    temp[index] = !edit[index];
    for (let i = 0; i < temp.length; i++) {
      if (i != index) temp[i] = false;
    }
    setEdit(temp);
  };

  const handleSaveNote = async (index, noteId) => {
    if (notesToDisplay[index].note) {
      props.page === 'order'
        ? await dispatch(
            putOrderNote(
              { newNote: notesToDisplay[index].note },
              noteId,
              props.orderId
            )
          )
        : await dispatch(
            putNote(
              { newNote: notesToDisplay[index].note },
              noteId,
              accountData._id
            )
          );

      setEdit([]);

      let errorTemp = JSON.parse(JSON.stringify(notesError));
      errorTemp[index] = '';
      setNotesError(errorTemp);
    } else {
      let temp = JSON.parse(JSON.stringify(notesError));
      temp[index] = 'This field cannot be empty!';
      setNotesError(temp);
    }
  };

  const handleNoteChange = (index, value) => {
    let temp = JSON.parse(JSON.stringify(notesToDisplay));
    temp[index] = { ...notesToDisplay[index], note: value };
    setNotes(temp);
  };

  useEffect(() => {
    (async () => {
      props.page === 'order'
        ? await dispatch(fetchOrderNotes(props.orderId))
        : await dispatch(fetchNotes(accountData._id));
    })();
  }, []);

  useEffect(() => {
    setNotes(notesList);
    if (notesList) {
      setEdit(new Array(notesList.length).fill(false));
    }
  }, [notesList]);

  useEffect(() => {
    setNotes(addNotes);
    if (addNotes) {
      setEdit(new Array(addNotes.length).fill(false));
    }
  }, [addNotes]);

  useEffect(() => {
    setNotes(updatedNoteData);
  }, [updatedNoteData]);

  useEffect(() => {
    setNotes(deleteNoteData);
    if (deleteNoteData) {
      setEdit(new Array(deleteNoteData.length).fill(false));
    }
  }, [deleteNoteData]);

  useEffect(() => {
    if (notes) {
      let temp = JSON.parse(JSON.stringify(notes));
      temp.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );
      setNotesToDisplay(temp);
      setNotesError([]);
      if (window.location.pathname.includes('order'))
        props.setNotesUpdated(true);
    }
  }, [notes]);

  return (
    <>
      <div className="inputNote">
        <input
          type="text"
          placeholder="Add note here..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button onClick={handleAddNote}>Add</button>
      </div>
      <p style={{ color: 'red' }}>{noteError}</p>

      <Table responsive className="table-hover ">
        <thead>
          <tr>
            <th>Notes</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {notesToDisplay &&
            notesToDisplay.map((item, index) => {
              return (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      readOnly={!edit[index]}
                      value={item.note}
                      onChange={e => handleNoteChange(index, e.target.value)}
                    />
                    <p style={{ color: 'red' }}>{notesError[index]}</p>
                  </td>
                  <td>{new Date(item.created).toLocaleString()}</td>
                  <td>
                    <ul className="icon-group">
                      {!edit[index] ? (
                        <li
                          className="edit-icon"
                          onClick={() => handleEditNote(index)}
                        >
                          <span>
                            <i class="far fa-edit"></i>
                          </span>
                        </li>
                      ) : (
                        <li
                          className="save-icon"
                          onClick={() => handleSaveNote(index, item._id)}
                        >
                          <span>
                            <i class="far fa-save"></i>
                          </span>
                        </li>
                      )}
                      <li onClick={() => handleDeleteNote(index, item._id)}>
                        <span>
                          <i class="far fa-trash-alt"></i>
                        </span>
                      </li>
                    </ul>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
};

export default Notes;
