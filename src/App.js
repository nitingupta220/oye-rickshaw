import React, { useState } from "react";
import "./App.css";
import XLSX from "xlsx";
import { Table, Button, Space, Input, Modal } from "antd";

function App() {
  const [file, setFile] = useState("");
  const [data, setData] = useState("");
  const [selectedRow, setSelectedRow] = useState([]);
  const [remark, setRemark] = useState("");
  const [visible, setVisible] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleUpload = (e) => {
    e.preventDefault();

    var reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = function (e) {
      var data = e.target.result;
      let readedData = XLSX.read(data, { type: rABS ? "binary" : "array" });
      const wsname = readedData.SheetNames[0];
      const ws = readedData.Sheets[wsname];

      /* Convert array to json*/
      const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let Given = [];
      for (var i = 0; i < dataParse.length; i++) {
        let newObj = [dataParse[i].toString()];
        Given.push(newObj);
      }
      const keys = Given[0][0].split(",");

      // then map over the rest of the sub arrays:
      const result = Given.slice(1).map(function (item) {
        // get values from current item
        const values = item[0].split(",");
        // create an object with key names and item values:
        const obj = {};
        keys.forEach(function (k, i) {
          obj[k] = values[i];
        });
        return obj;
      });

      setData(result);
    };
    reader.readAsBinaryString(file);
  };

  const columns = [
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Earning ID",
      dataIndex: "earning_id",
      key: "earning_id",
    },
    {
      title: "Earning",
      dataIndex: "earning",
      key: "earning",
    },
  ];
  const newData = [];
  for (var i = 0; i < data.length; i++) {
    let current = data[i];
    let obj = {};
    obj.mobile = current.mobile;
    obj.earning_id = current.earning_id;
    obj.earning = current.earning;
    obj.key = i;
    newData.push(obj);
  }
  const rowSelection = {
    onChange: (selectedRowKeys, rows) => {
      setSelectedRow(rows);
    },
  };

  const approve = (key) => {
    const newData = [];
    for (var i = 0; i < selectedRow.length; i++) {
      selectedRow[i].action = "approved";
      newData.push(selectedRow[i]);
    }
    console.log("Approving==>", newData);
    setSelectedRow([]);
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    selectedRow[0].remark = remark;
    selectedRow[0].action = "reject";
    console.log("rejecting==>", selectedRow);
    setRemark("");
    setVisible(false);
    setSelectedRow([]);
  };
  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div className="App">
      <h1>Oye Rickshaw</h1>
      <input type="file" onChange={handleChange} accept=".xlsx" />
      <Button type="primary" onClick={handleUpload}>
        Parse
      </Button>
      <br />
      <Space>
        {selectedRow.length > 0 && (
          <Button type="primary" onClick={() => approve("approve")}>
            Approve
          </Button>
        )}
        {selectedRow.length === 1 && (
          <>
            <Button type="primary" danger onClick={showModal}>
              Reject
            </Button>

            <Modal
              title="Basic Modal"
              visible={visible}
              onOk={handleOk}
              okText={"Send"}
              onCancel={handleCancel}
            >
              <Input type="text" onChange={(e) => setRemark(e.target.value)} />
            </Modal>
          </>
        )}
      </Space>
      {newData.length > 0 && (
        <Table
          columns={columns}
          dataSource={newData}
          pagination={false}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
        />
      )}
    </div>
  );
}

export default App;
