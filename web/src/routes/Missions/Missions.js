'use strict'
import moment from 'moment'
import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import slug from 'slug'

import Spinner from 'react-spinner'
import LoadingBox from '../../components/LoadingBox'

import '../../styles/react-spinner.css'
import './Missions.scss'

import {localDateTime, checkMissionStatus} from 'fbw-platform-common/utilities/time'

class Missions extends Component {

  componentDidMount () {
    if (this.props.bank) {
      this.props.getMissions({
        subjectBankId: this.props.bank.id,      // @Cole: need to fix this for the d2l case;
        username: this.props.user.username
      })
    }
  }

  // componentDidUpdate() {
  //   console.log('missions updated', this.props)
  //   if (this.props.privateBankId &&
  //       this.props.subjectBankId &&
  //       !this.props.isGetMissionsInProgress &&
  //       !this.props.missions) {
  //     console.log('Missions.js: getting missions from', this.props.subjectBankId)
  //     this.props.getMissions({
  //       subjectBankId: this.props.subjectBankId,
  //       username: this.props.username
  //     })
  //   }
  // }

  renderRow = (mission, sectionId, rowId) => {
    // Let students view past missions, but not submit any choices.
    // TODO: get the subject names from D2L

    let dlLocal = localDateTime(mission.deadline).toDate(),
      now = new Date(),
      deadlineText = 'Due',
      timeRemaining = (dlLocal - now) / 1000 / 60 / 60 / 24 ;

    let deadlineStyle;
    if (timeRemaining <= 1 && timeRemaining > 0) {
      deadlineStyle = {color: '#DB5142'};

    } else if (timeRemaining <= 0) {
      deadlineText = 'Closed';
      deadlineStyle = {color: '#888'}
    }

    // console.log(dlLocal)
    // console.log('missions mission', mission)

    let missionTypeIconSource
    if (mission.genusTypeId === 'assessment-genus%3Afbw-homework-mission%40ODL.MIT.EDU') {
      missionTypeIconSource = require('fbw-platform-common/assets/phase-1-icon@2x.png')

    } else if (mission.genusTypeId === 'assessment-genus%3Afbw-in-class-mission%40ODL.MIT.EDU') {
      missionTypeIconSource = require('fbw-platform-common/assets/phase-2-icon@2x.png');

    } else {
      console.error('uh oh. could not recognize genusTypeId in Missions.js');
    }

    return (
      <li className="missions-list__item" key={sectionId} onClick={() => this._onSelectMission(mission)}>
        <button className="clickable-row__button" >
          <div className="flex-container align-top">
            <img className="mission-type-icon" src={missionTypeIconSource} />

            <div className="missions-list__item__body">
              <p className="row-title mission-name">
                {mission.displayName.text}
              </p>
              <p className="row-subtitle mission-deadline" style={deadlineStyle} >
                {deadlineText}: {dlLocal.getMonth() + 1}-{dlLocal.getDate()}-{dlLocal.getFullYear()}
              </p>
            </div>
          </div>
      </button>
    </li>
    )
  }

  render() {

    let loadingBox;
    if (this.props.isGetMissionsInProgress) {
      loadingBox =  <LoadingBox type="enter-active"/>
    } else {
      loadingBox =  <LoadingBox type="enter"/>
    }

    let nonFutureMissions = _.filter(this.props.missions, (mission) => {
      return checkMissionStatus(mission) !== 'future'
    })
    let currentMissions = nonFutureMissions && nonFutureMissions.length > 0 ?
                ( <ul className="row-list">
                    {_.map(nonFutureMissions, this.renderRow)}
                  </ul> ) : null;

    return (
      <div className="medium-8 medium-centered large-6 large-centered columns">
          {currentMissions}
          {loadingBox}
      </div>)
  }

  _onSelectMission (mission) {
    let missionStatus = checkMissionStatus(mission);
    let username = this.props.user.username;
    let bankId = this.props.bank.id;

    if (missionStatus === 'over') {
      this.props.onSelectClosedMission({mission, bankId, username})
    } else {
      this.props.onSelectOpenMission({mission, bankId, username})
    }
    browserHistory.push(`/missions/${slug(mission.displayName.text)}`)
  }

}

export default Missions
