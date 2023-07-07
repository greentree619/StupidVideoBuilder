import React, { Component } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { DocsLink } from 'src/components'
import { Outlet, Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, alertConfirmOption } from 'src/utility/common.js'

export default class BuildSync extends Component {
  static displayName = BuildSync.name

  constructor(props) {
    super(props)
    this.state = {
      listData: [],
      loading: true,
      alarmVisible: false,
      alertMsg: '',
      alertColor: 'success',
      curPage: 1,
      totalPage: 1,
    }
  }

  componentDidMount() {
    this.populateData(1)
  }

  gotoPrevPage() {
    this.populateData(this.state.curPage - 1)
  }

  gotoNextPage() {
    this.populateData(this.state.curPage + 1)
  }

  async onBuild(_id, domain, ip) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }

    var s3Host = loadFromLocalStorage('s3host')
    var s3Name = s3Host.name == null ? "" : s3Host.name;
    var s3Region = s3Host.region == null ? "" : s3Host.region;
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}buildsync/${_id}/${domain}/domainIp/${ip}?s3Name=${s3Name}&region=${s3Region}`,
      requestOptions,
    )
    // this.setState({
    //   alertColor: 'danger',
    //   alertMsg: 'Zip file can not be create, unfortunatley.',
    // })
    let ret = await response.json()
    if (response.status === 200 && ret) {
      // this.setState({
      //   alertColor: 'success',
      //   alertMsg: 'Zip file was created successfully.',
      // })
      toast.success('Zip file was created successfully.', alertConfirmOption);
    }
    else
    {
      toast.error('Zip file can not be create, unfortunatley.', alertConfirmOption);
    }
    // this.setState({
    //   alarmVisible: true,
    // })
  }

  async onSync(_id, domain, ip) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }

    var s3Host = loadFromLocalStorage('s3host')
    var s3Name = s3Host.name == null ? "" : s3Host.name;
    var s3Region = s3Host.region == null ? "" : s3Host.region;
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}buildsync/sync/${_id}/${domain}/${ip}?s3Name=${s3Name}&region=${s3Region}`,
      requestOptions,
    )
    // this.setState({
    //   alertColor: 'danger',
    //   alertMsg: 'Sync action failed, unfortunatley.',
    // })
    let ret = await response.json()
    if (response.status === 200 && ret) {
      // this.setState({
      //   alertColor: 'success',
      //   alertMsg: 'Sync action compeleted, successfully.',
      // })
      toast.success('Sync action compeleted, successfully.', alertConfirmOption);
    }
    else
    {
      toast.error('Sync action failed, unfortunatley.', alertConfirmOption);
    }
    // this.setState({
    //   alarmVisible: true,
    // })
  }

  renderProjectsTable(state) {
    let pageButtonCount = 3
    let pagination = <p></p>

    if (this.state.totalPage > 1) {
      let prevButton = (
        <CPaginationItem onClick={() => this.gotoPrevPage()}>Previous</CPaginationItem>
      )
      if (state.curPage <= 1) prevButton = <CPaginationItem disabled>Previous</CPaginationItem>

      let nextButton = <CPaginationItem onClick={() => this.gotoNextPage()}>Next</CPaginationItem>
      if (state.curPage >= state.totalPage)
        nextButton = <CPaginationItem disabled>Next</CPaginationItem>

      var pageNoAry = []
      var startNo = state.curPage - pageButtonCount
      var endNo = state.curPage + pageButtonCount
      if (startNo < 1) {
        startNo = 1
        endNo =
          pageButtonCount * 2 + 1 > state.totalPage ? state.totalPage : pageButtonCount * 2 + 1
      } else if (endNo > state.totalPage) {
        endNo = state.totalPage
        startNo = endNo - pageButtonCount * 2 > 1 ? endNo - pageButtonCount * 2 : 1
      }

      for (var i = startNo; i <= endNo; i++) {
        if (i < 1 || i > state.totalPage) continue
        pageNoAry.push(i)
      }

      const paginationItems = pageNoAry.map((number) => (
        <CPaginationItem
          key={number}
          onClick={() => this.populateData(number)}
          active={number == state.curPage}
        >
          {number}
        </CPaginationItem>
      ))

      pagination = (
        <CPagination align="center" aria-label="Page navigation example">
          {prevButton}
          {paginationItems}
          {nextButton}
        </CPagination>
      )
    }

    return (
      <>
        <CAlert
          color={state.alertColor}
          dismissible
          visible={state.alarmVisible}
          onClose={() => this.setState({ alarmVisible: false })}
        >
          {state.alertMsg}
        </CAlert>
        {/* <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          /> */}
        <table className="table">
          <thead>
            <tr>
              <th className='text-center'>Id</th>
              <th className='text-center'>Web Site</th>
              <th className='text-center'>IP</th>
              <th className='text-center'>Action</th>
            </tr>
          </thead>
          <tbody>
            {state.listData.map((row) => (
              <tr key={row.id}>
                <td className='text-center'>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.ip}</td>
                <td className='text-center'>
                  <CButton type="button" onClick={() => this.onBuild(row.id, row.name, row.ip)}>
                    Build
                  </CButton>
                  &nbsp;
                  <CButton type="button" onClick={() => this.onSync(row.id, row.name, row.ip)}>
                    SYNC
                  </CButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination}
      </>
    )
  }

  render() {
    let contents = this.state.loading ? (
      <p>
        <em>Loading...</em>
      </p>
    ) : (
      this.renderProjectsTable(this.state)
    )
    return (
      <CCard className="mb-4">
        <CCardHeader>All Web Sites</CCardHeader>
        <CCardBody>{contents}</CCardBody>
      </CCard>
    )
  }

  async populateData(pageNo) {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}project/` + pageNo + '/200')
    const data = await response.json()
    this.setState({
      listData: data.data,
      loading: false,
      alarmVisible: false,
      curPage: data.curPage,
      totalPage: data.total,
    })
  }
}
