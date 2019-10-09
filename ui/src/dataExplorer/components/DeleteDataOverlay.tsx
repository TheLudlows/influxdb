// Libraries
import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {withRouter, WithRouterProps} from 'react-router'
import {Overlay} from '@influxdata/clockface'
import {get} from 'lodash'

// Components
import DeleteDataForm from 'src/shared/components/DeleteDataForm/DeleteDataForm'
import GetResources, {ResourceType} from 'src/shared/components/GetResources'

// Utils
import {getActiveTimeMachine, getActiveQuery} from 'src/timeMachine/selectors'

// Types
import {AppState, TimeRange} from 'src/types'

const resolveTimeRange = (timeRange: TimeRange): [number, number] | null => {
  const [lower, upper] = [
    Date.parse(timeRange.lower),
    Date.parse(timeRange.upper),
  ]

  if (!isNaN(lower) && !isNaN(upper)) {
    return [lower, upper]
  }

  return null
}

interface StateProps {
  selectedBucketName?: string
  selectedTimeRange?: [number, number]
}

interface OwnProps {
  bucketID?: string
  onDismiss: () => void
}

const DeleteDataOverlay: FunctionComponent<
  OwnProps & StateProps & WithRouterProps
> = ({selectedBucketName, selectedTimeRange, params: {orgID}, onDismiss}) => {
  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header title="Delete Data" onDismiss={onDismiss} />
        <Overlay.Body>
          <GetResources resource={ResourceType.Buckets}>
            <DeleteDataForm
              initialBucketName={selectedBucketName}
              initialTimeRange={selectedTimeRange}
              orgID={orgID}
            />
          </GetResources>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

const mstp = (state: AppState, {bucketID}: OwnProps): StateProps => {
  const activeQuery = getActiveQuery(state)
  const selectedBucket = state.buckets.list.find(b => b.id === bucketID)

  const selectedBucketName =
    get(selectedBucket, 'name') || get(activeQuery, 'builderConfig.buckets.0')

  const {timeRange} = getActiveTimeMachine(state)
  const selectedTimeRange = resolveTimeRange(timeRange)

  return {selectedBucketName, selectedTimeRange}
}

export default connect<StateProps>(mstp)(
  withRouter<OwnProps>(DeleteDataOverlay)
)