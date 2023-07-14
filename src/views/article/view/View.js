import PropTypes from 'prop-types'
import React, { useEffect, useState, createRef, useRef } from 'react'
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
  CFormCheck,
  CImage,
  CModal,
  CModalBody,
  CModalTitle,
  CModalFooter,
  CModalHeader,
  CFormSwitch,
  CContainer,
  COffcanvas,
  COffcanvasHeader,
  CCloseButton,
  CCardTitle,
  CCardText,
  CNavLink,
} from '@coreui/react'
import { rgbToHex } from '@coreui/utils'
import { DocsLink } from 'src/components'
import { useLocation, useNavigate } from 'react-router-dom'
import SunEditor,{buttonList} from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import plugins from 'suneditor/src/plugins'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import pixabayImageGallery  from 'src/plugins/PixabayImageGallery'
import openAIImageGallery  from 'src/plugins/OpenAIImageGallery'
import openAIVideoLibrary  from 'src/plugins/OpenAIVideoLibrary'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import {saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, alertConfirmOption } from 'src/utility/common.js'
import AddImage from 'src/assets/images/AddImage.png'
import { render } from '@testing-library/react'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import AddImagesComponent from '../common/AddImagesComponent'

const View = (props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const activeProject = useSelector((state) => state.activeProject)
  const [alarmVisible, setAlarmVisible] = useState(false)
  const [alertColor, setAlertColor] = useState('success')
  const [alertMsg, setAlertMsg] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [videoDetail, setVideoDetail] = useState({})
  const [pixabayURL, setPixabayURL] = useState(`https://pixabay.com/api/?key=14748885-e58fd7b3b1c4bf5ae18c651f6&q=&image_type=photo&min_width=${process.env.REACT_APP_PIXABAY_MIN_WIDTH}&min_height=${process.env.REACT_APP_PIXABAY_MIN_HEIGHT}&per_page=100&page=1`)
  const [addImgVisible, setAddImgVisible] = useState(false)
  const [imageGallery, setImageGallery] = useState([])
  const [image, setImage] = useState('')
  const [thumbImage, setThumbImage] = useState(null)
  const addImagesComponent = useRef()
  
  console.log(activeProject)

  useEffect(() => {
    const getFetch = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}video/byTitle/` + activeProject.id + `/` + location.state.article.title,
      )
      const data = await response.json()
      console.log(data)
      setTitle(data.data.title)
      if (data.data.script != null) setContent(data.data.script)
      if (data.data.backgroundImage != null) setImage(data.data.backgroundImage)
      if (data.data.backgroundThumbImage != null) setThumbImage(data.data.backgroundThumbImage)
      setVideoDetail(data.data)

      let q = data.data.title.replaceAll(' ', '+').replaceAll('?', '')
      console.log(data.data.title, q)
      let openAIKeyword = data.data.title.replaceAll('?', '')
      console.log(data.data.title, openAIKeyword)
      setPixabayURL()
      //console.log(footEditor.current.core.options.imageGalleryLoadURL)
    }
    getFetch()
  }, [])

  const updateContent = async () => {
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: location.state.article.id,
        title: title,
        script: content,
        state: videoDetail.state,
        backgroundImage: image,
        backgroundThumbImage: thumbImage,
      }),
    }

    console.log(location.state.projectInfo);
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}video/update_content/${location.state.projectInfo.projectid}`, requestOptions)
    let ret = await response.json()
    if (response.status === 200 && ret) {
      toast.success('Video content is updated successfully.', alertConfirmOption);
    }
    else
    {
      toast.error('Faild to update content unfortunatley.', alertConfirmOption);
    }
    // setAlarmVisible(true)
  }

  const deleteImageConfirm = (idx) => {
    confirmAlert({
      title: 'Warnning',
      message: 'Are you sure to delete this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteImage(idx)
        },
        {
          label: 'No',
          onClick: () => {return false;}
        }
      ]
    });
  }

  const deleteImage = async (idx) => {
    console.log("deleteImage=>", idx)
    // var tmpimgAry = [...imageArray]
    // var tmpThumImgAry = [...thumbImageArray]
    // tmpimgAry.splice(idx, 1)
    // tmpThumImgAry.splice(idx, 1)
    setImage('')
    setThumbImage('')
    console.log(thumbImage)
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Video View</CCardHeader>
        <CCardBody>
          <CForm className="row g-3 needs-validation">
            <div className="mb-3">
              <CFormLabel htmlFor="exampleFormControlInput1">Title</CFormLabel>
              <CFormInput
                type="text"
                id="titleFormControlInput"
                aria-label="title"
                disabled
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <CCard style={{ width: '100%' }}>
              <CCardBody>
                <CCardTitle>Video Background Images</CCardTitle>
                <CCardText>
                  <div className="clearfix">
                  {thumbImage != null && (<>
                      &nbsp;<CImage onClick={() => deleteImageConfirm(0)} align="start" rounded src={((thumbImage.substr(0, 10) == "data:image" || thumbImage.substr(0, 6) == "https:") ? thumbImage : ("data:image/jpeg;base64," + thumbImage))} width={80} height={80} />
                    </>)}
                    &nbsp;<CImage onClick={() => addImagesComponent.current.showAddImageModal()} align="start" rounded src={AddImage} width={80} height={80} />
                  </div>                  
                </CCardText>
              </CCardBody>
            </CCard>
            <div className="mb-3">
              <CRow>
                <CCol>
                  <CFormTextarea
                    id="scriptTextArea"
                    label="Video Script"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    text="Must be 8-20 words long."
                  ></CFormTextarea>
                </CCol>
              </CRow>
            </div>
            <div>
              <video id={"talk-video"} src={videoDetail.awsVideoLink}  autoPlay muted={true} loop={true} width={400} controls={true}>
              </video>
            </div>
            
            <div className="mb-3">
              <CButton type="button" onClick={() => navigate(-1)}>
                Back
              </CButton>
              &nbsp;
              <CButton type="button" onClick={() => updateContent()}>
                Update
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
      {/* <AddImagesComponent
        ref={addImagesComponent}
        title={title}
        addImgVisible={addImgVisible}
        setAddImgVisible={setAddImgVisible}
        imageArray={imageArray}
        setImageArray={setImageArray}
        thumbImageArray={thumbImageArray}
        setThumbImageArray={setThumbImageArray}
      /> */}
    </>
  )
}

export default View
