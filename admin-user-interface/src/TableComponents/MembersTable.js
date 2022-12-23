import React, { useEffect, useState } from 'react';
import axios from '../api';
import { CreateTwoTone, PersonRemoveTwoTone } from '@mui/icons-material';
// import Typography from '@mui/material/Typography'
// import Button from '@mui/material/Button';  
import { URL } from '../config';
import './MembersTable.css';

import {
  Button,
  Input,
  Popconfirm,
  Form,
  Table,
  Typography,
  notification,
  InputNumber,
} from 'antd';

const { Search } = Input;
const sourceData = [];
const EditCell = ({
  edit,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {edit ? (
        <Form.Item
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `Enter the ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const MembersTable = () => {
  const [form] = Form.useForm();
  let [data, getData] = useState(sourceData);
  const [editingKey, getEditingKey] = useState('');

  const [filter, setFilter] = useState('');

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
    });
  };
  data =
    data &&
    data.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toLowerCase().includes(filter)
      );
    });
  const removeId = (id) => {
    data = data.filter((item) => {
      return item.id !== id;
    });
    getData(data);
  };

  // Removing Data
  const [selectedData, setSelectedData] = useState([]);
  const remove = () => {
    const idArray = selectedData.map((e) => e.id);
    data = data.filter((item) => {
      return !idArray.includes(item.id);
    });
    getData(data);
    setSelectedData([]);
  };

  // getting from the API
  const [loading, getLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        getLoading(true);
        let { data } = await axios.get(URL);
        data = data.map((item) => {
          var temp = Object.assign({}, item);
          temp.key = item.id;
          return temp;
        });
        getData(data);
        getLoading(false);
      } catch (error) {
        getLoading(false);
        console.log(error);
        openNotificationWithIcon('error', error.message);
      }
    };
    fetchData();
  }, []);

  // Editing 
  const liveEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record,
    });
    getEditingKey(record.key);
  };

  //Exit Editing
  const exit = () => {
    getEditingKey('');
  };

  //Save the edited Record

  const save = async (key) => {
    try {
      const newRow = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...newRow });
        getData(newData);
        getEditingKey('');
      } else {
        newData.push(newRow);
        getData(newData);
        getEditingKey('');
      }
    } catch (error) {
      console.log('Failed to add new row:', error);
    }
  };

  const columnNames = [
    {
      title: 'Full Name',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      width: '30%',
      editable: true,
    },
    {
      title: 'Role / Position',
      dataIndex: 'role',
      width: '20%',
      editable: true,
    },
    {
      title: 'Edit Options',
      dataIndex: 'operation',
      className: 'operation',
      width: '50%',
      render: (_, record) => {
        const editable = liveEditing(record);
        return (
          <>
            {editable ? (
              <span>
                <a
                  href="/#"
                  onClick={() => save(record.key)}  // Saves the editing changes
                  style={{
                    marginRight: 8,    // space between save and exir options
                  }}
                >
                  Save
                </a> 
                <Popconfirm title="Exit" onConfirm={exit}>   
                  <a href="/#">Exit</a>
                </Popconfirm>  
              </span>
            ) : (
              <Typography.Link
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
              >
                <CreateTwoTone />
              </Typography.Link>
            )}
            <div className="delete-btn">
              <Typography.Link
                disabled={editingKey !== ''}
                onClick={() => removeId(record.id)}
              >
                <PersonRemoveTwoTone twoToneColor="#ff0000" />
              </Typography.Link>
            </div>
          </>
        );
      },
    },
  ];
  const finalColumns = columnNames.map((column) => {
    if (!column.editable) {
      return column;
    }

    return {
      ...column,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: column.dataIndex,
        title: column.title,
        edit: liveEditing(record),
      }),
    };
  });
  const selectRow = {
    onChange: (Row, selectedRow) => {
      console.log(`Row: ${Row}`, 'selectedRow: ', selectedRow);
      setSelectedData(selectedRow);
    },
  };

  const onSearchHandler = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  return (
    <div className="members">
      <div className='searchBar'>
      <Search
        placeholder="Enter the Name, Email or Role to be searched"
        onChange={onSearchHandler}
        enterButton
      />
      </div>
      <div className='form'>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditCell,
            },
          }}
          rowSelection={{
            ...selectRow,
          }}
          bordered
          dataSource={data}
          columns={finalColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: exit,
          }}
        />
      </Form>
      </div>
      {selectedData.length > 0 && (
        <Button
          type="primary"
          danger
          className="delete-selected-btn"
          onClick={() => remove()}
        >
          Delete
        </Button>
      )}
    </div>
  );
};

export default MembersTable;
