import PropTypes from 'prop-types'
import React, { useEffect, useState, createRef } from 'react'
import classNames from 'classnames'
import {
  CRow,
  CCol,
  CCard,
  CButton,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CAlert,
  CFormTextarea,
  CDropdown,
  CDropdownItem,
  CDropdownToggle,
  CDropdownMenu,
  CContainer,
  CSpinner,
  CFormSelect,
  CFormCheck
} from '@coreui/react'
import { rgbToHex } from '@coreui/utils'
import { DocsLink } from 'src/components'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {saveToLocalStorage, globalRegionMap, loadFromLocalStorage, clearLocalStorage, alertConfirmOption } from 'src/utility/common'
import {languageMap} from 'src/utility/LanguageCode'
import {countryMap} from 'src/utility/CountryCode'
import { ReactSession }  from 'react-client-session'

const Add = (props) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [simpleMode, setSimpleMode] = useState(
    location.state != null && location.state.simple_mode != null
      ? location.state.simple_mode
      : false,
  )

  const activeProject = useSelector((state) => state.activeProject)
  if (location.search.length > 0) {
    //console.log()
    const linkMode = new URLSearchParams(location.search).get('mode')
    if (linkMode == 'view') {
      location.state = { project: activeProject, mode: 'VIEW' }
    }
  }

  const [validated, setValidated] = useState(false)
  const [projectName, setProjectName] = useState(
    location.state != null && !simpleMode ? location.state.project.name : '',
  )
  const [width, setWidth] = useState(
    location.state != null && !simpleMode ? location.state.project.width : 400,
  )
  const [height, setHeight] = useState(
    location.state != null && !simpleMode ? location.state.project.height : 300,
  )
  const [youtubeChannel, setYoutubeChannel] = useState(
    location.state != null && !simpleMode ? location.state.project.youtubeChannel : '',
  )
  const [searchKeyword, setSearchKeyword] = useState(
    location.state != null && !simpleMode ? location.state.project.keyword : '',
  )
  const [questionsCount, setQuestionsCount] = useState(
    location.state != null && !simpleMode ? location.state.project.quesionsCount : 50,
  )

  const [alarmVisible, setAlarmVisible] = useState(false)
  const [alertColor, setAlertColor] = useState('success')
  const [alertMsg, setAlertMsg] = useState('')
  const [mode, setMode] = useState('ADD')
  const [s3BucketList, setS3BucketList] = useState([])
  const [language, setLanguage] = useState(
    location.state && !simpleMode ? location.state.project.languageString : 'Engllish',
  )
  const [languageValue, setLanguageValue] = useState(
    location.state && !simpleMode ? location.state.project.language : 'en',
  )
  const [isOnScrapping, setIsOnScrapping] = useState(false)
  const [isOnAFScrapping, setIsOnAFScrapping] = useState(false)
  const [isOnPublish, setIsOnPublish] = useState(false)
  const [disabledUpdate, setDisabledUpdate] = useState(false)

  const handleSubmit = (event) => {
    const form = event.currentTarget
    event.preventDefault()

    if (location.state != null && !simpleMode && location.state.mode == 'EDIT') {
      postAddProject()
    } else if (location.state != null && !simpleMode && location.state.mode == 'VIEW') {
      navigate(-1)
    } else {
      if (form.checkValidity() === false) {
        event.stopPropagation()
      } else {
        postAddProject()
      }
      setValidated(true)
    }
  }

  const inputChangeHandler = (setFunction, event) => {
    setFunction(event.target.value)
  }

  async function postAddProject() {
    var projInfo = {
      id: location.state && !simpleMode ? location.state.project.id : '-1',
      name: projectName,
      width: width,
      height: height,
      youtubeChannel: youtubeChannel,
      keyword: searchKeyword,
      quesionscount: questionsCount,
      language: languageValue,
      languageString: language,
    }

    const requestOptions = {
      method: location.state && !simpleMode ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projInfo),
    }

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}video`, requestOptions)
    // setAlertColor('danger')
    // setAlertMsg('Faild to create/update new domain unfortunatley.')
    let ret = await response.json()
    if (response.status === 200 && ret.result) {
      // setAlertMsg('Created/Updated new domain successfully.')
      // setAlertColor('success')
      toast.success('Created/Updated new domain successfully.', alertConfirmOption);

      console.log("ret.error", ret.error)
      if (ret.error.length > 0) {
        dispatch({ type: 'set', notification: [ret.error] })
      }

      location.state.project = projInfo
      dispatch({ type: 'set', activeDomainName: location.state.project.name })
      dispatch({ type: 'set', activeProject: location.state.project })

      if (location.state && !simpleMode)
      {//Because update, update redux project array.
        var allProjects = loadFromLocalStorage('allProjects')
        if(allProjects != null && allProjects != undefined)
        {
          let tmpProjects = [...allProjects]
          let idx = tmpProjects.findIndex((pro) => pro.id === projInfo.id)
          tmpProjects[idx] = projInfo//tmpProjects.splice(idx, 1)
          saveToLocalStorage(tmpProjects, 'allProjects')
        }
      }

      if (simpleMode)
      {
        ReactSession.set("allProjects", "0")
        clearLocalStorage('allProjects')
        navigate('/dashboard')
      }
    }
    else {
      toast.error('Faild to create/update new domain unfortunatley.', alertConfirmOption);
    }
    //setAlarmVisible(true)
  }

  const handleClick = (lang, value) => {
    setLanguageValue(value)
    setLanguage(lang)
    //console.log('clicked ' + i + ', state.value = ' + languageValue)
  }

  const renderItem = (lang, value) => {
    return (
      <CDropdownItem key={value} onClick={() => handleClick(lang, value)}>
        {lang}
      </CDropdownItem>
    )
  }

  let ActionMode = 'Create'
  if (location.state != null && !simpleMode && location.state.mode == 'EDIT') {
    ActionMode = 'Update'
  } else if (location.state != null && !simpleMode && location.state.mode == 'VIEW') {
    ActionMode = 'Back'
  }

  async function scrapQuery(_id, keyword, count) {
    keyword = keyword.replaceAll(';', '&')
    keyword = keyword.replaceAll('?', ';')
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}project/serpapi/` + _id + '/' + keyword + '/' + count,
    )
    // setAlarmVisible(false)
    // setAlertMsg('Unfortunately, scrapping faild.')
    // setAlertColor('danger')
    if (response.status === 200) {
      //console.log('add success')
      // setAlertMsg('Completed to scrapping questions from google successfully.')
      // setAlertColor('success')
      toast.success('Completed to scrapping questions from google successfully.', alertConfirmOption);
    }
    else {
      toast.error('Unfortunately, scrapping faild.', alertConfirmOption);
    }
    // setAlarmVisible(true)
  }

  const renderLanguageItem = () => {
    //if(location.state != null )
    return 'English'
  }

  useEffect(() => {
    //Omitted console.log("location.search.length = " + location.search.length, location.state.project)
    dispatch({ type: 'set', activeTab: "project_add" })
    if (location.search.length == 0
      && (location.state != null && (location.state.mode == 'VIEW' || location.state.mode == 'EDIT'))) {
      //normal link
      if (location.state != null && !simpleMode) {
        dispatch({ type: 'set', activeDomainName: location.state.project.name })
        dispatch({ type: 'set', activeDomainId: location.state.project.id })
        dispatch({ type: 'set', activeProject: location.state.project })
        dispatch({ type: 'set', activeDomainIp: location.state.project.ip })
        saveToLocalStorage({name: location.state.project.s3BucketName, region: location.state.project.s3BucketRegion}, 's3host')
        // var s3Host = loadFromLocalStorage('s3host')
        // console.log('s3Host=>', s3Host)
      } else {
        dispatch({ type: 'set', activeDomainName: '', activeProject: {}, activeDomainId: '' })
      }
    }

    return () => {
      //unmount
      // clearInterval(refreshIntervalId);
      console.log('project scrapping status interval cleared!!!');
    }
  }, [])

  const readKeyFile = async (e) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)
      //console.log(text)
      //alert(text.replaceAll('\r\n', ';'))
      var tmpKeyword = text.replaceAll('\r\n', ';')
      if (tmpKeyword[tmpKeyword.length - 1] == ';') tmpKeyword = tmpKeyword.substring(0, tmpKeyword.length - 1)
      setSearchKeyword(tmpKeyword);
    };
    reader.readAsText(e.target.files[0])
  }

  return (
    <>
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
      <CContainer className="px-4">
        <CRow xs={{ gutterX: 5 }}>
          <CCol>
            <CCard className="mb-4">
              <CCardHeader>New/Update Project</CCardHeader>
              <CCardBody>
                <CAlert
                  color={alertColor}
                  dismissible
                  visible={alarmVisible}
                  onClose={() => setAlarmVisible(false)}
                >
                  {alertMsg}
                </CAlert>
                <CForm
                  className="row g-3 needs-validation"
                  noValidate
                  validated={validated}
                  onSubmit={handleSubmit}
                >
                  <CRow>
                    <CCol>
                      <div className="mb-3">
                        <CRow>
                          <CCol>
                            <CRow>
                              <CCol>
                                <CFormLabel htmlFor="projectNameFormControlInput">
                                  Project
                                </CFormLabel>
                              </CCol>
                            </CRow>
                            <CFormInput
                              type="text"
                              id="projectNameFormControlInput"
                              placeholder="Project Name"
                              aria-label="Project Name"
                              required
                              onChange={(e) => inputChangeHandler(setProjectName, e)}
                              disabled={location.state != null && !simpleMode && location.state.mode == 'VIEW'}
                              value={projectName}
                            />
                          </CCol>
                        </CRow>
                      </div>
                      <div className={simpleMode ? 'd-none' : 'mb-3'}>
                        <CRow>
                          <CFormLabel htmlFor="exampleFormControlInput1" className="col-sm-4 col-form-label">Language({languageValue})</CFormLabel>
                          <CCol sm={8}>
                            <CDropdown
                              id="axes-dd"
                              className="float-right mr-0"
                              size="sm"
                              disabled={location.state != null && !simpleMode && location.state.mode == 'VIEW'}
                            >
                              <CDropdownToggle
                                id="axes-ddt"
                                color="secondary"
                                size="sm"
                                disabled={location.state != null && !simpleMode && location.state.mode == 'VIEW'}
                              >
                                {language}
                              </CDropdownToggle>
                              <CDropdownMenu>
                                {languageMap.map((langInfo, index) => {
                                  return renderItem(langInfo.lang, langInfo.value)
                                })}
                              </CDropdownMenu>
                            </CDropdown>
                          </CCol>
                        </CRow>
                      </div>
                    </CCol>
                    <CCol className={simpleMode ? 'd-none' : ''}>
                      <CRow className="mb-3 pt-4">
                        <CFormLabel htmlFor="Width" className="col-sm-4 col-form-label">Width</CFormLabel>
                        <CCol sm={8}>
                          <CFormInput type="text" id="Width" value={width} onChange={(e) => inputChangeHandler(setWidth, e)}
                            disabled={location.state != null && !simpleMode && location.state.mode == 'VIEW'}/>
                        </CCol>
                      </CRow>
                      <CRow className="mb-3 py-0">
                        <CFormLabel htmlFor="Height" className="col-sm-4 col-form-label">Hieght</CFormLabel>
                        <CCol sm={8}>
                          <CFormInput type="text" id="Height" value={height} onChange={(e) => inputChangeHandler(setHeight, e)}
                            disabled={location.state != null && !simpleMode && location.state.mode == 'VIEW'}/>
                        </CCol>
                      </CRow>
                    </CCol>
                  </CRow>

                  <div className="mb-3">
                    {location.state != null && !simpleMode && (
                      <CButton type="button" onClick={() => navigate('/project/add')}>
                        New Project
                      </CButton>
                    )}
                    &nbsp;
                    {location.state != null && !simpleMode && location.state.mode == 'VIEW' && (
                      <>
                        <CButton
                          type="button"
                          onClick={() =>
                            scrapQuery(
                              location.state.project.id,
                              location.state.project.keyword,
                              location.state.project.quesionsCount,
                            )
                          }
                        >
                          Scrap
                        </CButton>
                        &nbsp;
                        <Link
                          to={`/project/add`}
                          state={{ mode: 'EDIT', project: location.state.project }}
                        >
                          <CButton type="button">Edit</CButton>
                        </Link>
                      </>
                    )}
                    &nbsp;
                    <CButton type="submit" disabled={disabledUpdate}>{ActionMode}</CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default Add
