import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, ViewPropTypes } from 'react-native'
import Svg, { Defs, Stop, G, Path, LinearGradient, Circle } from 'react-native-svg'
import { arc } from 'd3-shape'
import range from 'lodash/range'
import convert from 'color-convert'

function calculateStopColor(i, beginColor, endColor) {
  return [
    Math.round(beginColor[0] + ((endColor[0] - beginColor[0]) * i) ),
    Math.round(beginColor[1] + ((endColor[1] - beginColor[1]) * i) ),
    Math.round(beginColor[2] + ((endColor[2] - beginColor[2]) * i) ),
  ]
}

const LINEAR_GRADIENT_PREFIX_ID = 'gradientRing'
export default class CircularProgress extends Component {
  static renderLinearGradients(state) {
    const { r1, beginColor, endColor, segments } = state
    let startColor = beginColor
    let stopColor = calculateStopColor(1, beginColor, endColor, segments)
    let startAngle = 0
    let stopAngle = (2 * Math.PI)

    return range(1, segments + 1).map(i => {
      const linearGradient = (
        <LinearGradient
          id={LINEAR_GRADIENT_PREFIX_ID + i}
          key={LINEAR_GRADIENT_PREFIX_ID + i}
        >
          <Stop offset="0" stopColor={'rgb(' + startColor.join(',') + ')'} />
          <Stop offset="1" stopColor={'rgb(' + stopColor.join(',') + ')'} />
        </LinearGradient>
      )
      startColor = stopColor
      stopColor = calculateStopColor(i + 1, beginColor, endColor, segments)
      startAngle = stopAngle
      stopAngle += (2 * Math.PI)
      return linearGradient
    })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { width, size, beginColor, endColor, segments } = nextProps;
    let nextState = {}

    if (segments !== prevState.segments) {
      nextState.segments = segments
    }

    if (width !== prevState.width || size !== prevState.size) {
      const r2 = size / 2
      nextState = {
        ...nextState,
        r1: r2 - width,
        r2,
        width,
        size,
      }
    }

    if (beginColor !== prevState.beginColorCached || endColor !== prevState.endColorCached) {
      // CHANGE COLOR ORDER
      nextState = {
        ...nextState,
        beginColorCached: beginColor,
        endColorCached: endColor,
        beginColor: convert.hex.rgb(endColor),
        endColor: convert.hex.rgb(beginColor),
      }
    }

    const keys = Object.keys(nextState);

    if (keys.length) {
      const combinedState = { ...prevState, ...nextState }
      nextState.linearGradients = CircularProgress.renderLinearGradients(combinedState)
      nextState.renderLinearGradient =  CircularProgress.LinearGradient(combinedState)
    }
    return keys.length ? nextState : null
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  extractFill() {
    return Math.min(100, Math.max(0, this.props.fill))
  }

  extractFill2() {
    return Math.min(100, Math.max(0, this.props.fillAtChoose))
  }

  renderBackgroundPath2() {
    const { r1, r2 } = this.state
    let fill = this.extractFill2()
    const { size, width, backgroundColor } = this.props
    const backgroundPath2 = arc()
    .innerRadius(r1)
    .outerRadius(r2)
    .startAngle(0)
    .endAngle(-2 * Math.PI * (fill /100) )
    return <Path x={size / 2} y={size / 2} d={backgroundPath2()} fill={'#ff884c'} />
  }

  renderBackgroundPath() {
    const { r1, r2 } = this.state
    const { size, width, backgroundColor } = this.props
    const backgroundPath1 = arc()
    .innerRadius(r1)
    .outerRadius(r2)
    .startAngle(0)
    .endAngle(-2 * Math.PI)
    return <Path x={size / 2} y={size / 2} d={backgroundPath1()} fill={backgroundColor} />
  }

  static LinearGradient (state) {
    const {beginColor, endColor} = state
    return (
      <LinearGradient id="grad" x1="50%" y1="0" x2="50%" y2="85%">
        <Stop offset="0" stopColor={endColor} stopOpacity="1" />
        <Stop offset="1" stopColor={beginColor} stopOpacity="0.8" />
      </LinearGradient>
    )
  }

  renderCirclePaths() {
    const { r1, r2, segments } = this.state
    const { size, width, beginColor, isChoose, backgroundColor, endColor } = this.props
    const fill = this.extractFill()

    let numberOfPathsToDraw = Math.floor((2 * Math.PI * (fill / 100)) / ((2 * Math.PI) ))
    let rem = ((2 * Math.PI * (fill / 100)) / ((2 * Math.PI))) % 1
    if (rem > 0) {
      numberOfPathsToDraw++
    }
    let startAngle = 0;
    let stopAngle = -(2 * Math.PI)

    return [
      <Circle
        key="start_circle" cx={size / 2} cy={width / 2} r={width / 2}
        fill={endColor}
      />,
      ...range(1, numberOfPathsToDraw + 1).map(i => {
        if (i === numberOfPathsToDraw && rem) {
          stopAngle = -2 * Math.PI * (fill / 100)
        }
        const circlePath = arc()
        .innerRadius(r1)
        .outerRadius(r2)
        .startAngle(startAngle)
        .endAngle(stopAngle)
        const path = (
          <Path
            x={this.props.size / 2}
            y={this.props.size / 2}
            key={fill + i}
            d={circlePath()}
            fill={endColor}
          />
        );
        startAngle = stopAngle;
        stopAngle -= (2 * Math.PI)
        return path
      }),
      <Circle
        key="end_circle"
        cx={(r2 - (r2 - r1) / 2) * Math.sin(2 * Math.PI * (fill / 100) - Math.PI) + size / 2}
        cy={(r2 - (r2 - r1) / 2) * Math.cos(2 * Math.PI * (fill / 100) - Math.PI) + size / 2}
        r={width / 2}
        fill={endColor}
      />,
    ];
  }

  renderCirclePaths2() {
    const { r1, r2, segments } = this.state
    const { size, width, beginColor } = this.props
    const fill = this.extractFill2()
    let numberOfPathsToDraw = Math.floor((2 * Math.PI * (fill / 100)) / ((2 * Math.PI) / segments))
    let rem = ((2 * Math.PI * (fill / 100)) / ((2 * Math.PI) / segments)) % 1
    if (rem > 0) {
      numberOfPathsToDraw++
    }
    let startAngle = 0;
    let stopAngle = -(2 * Math.PI)

    return [
      <Circle
        key="start_circle" cx={size / 2} cy={width / 2} r={width / 2}
        fill={beginColor}
      />,
      ...range(1, numberOfPathsToDraw + 1).map(i => {
        if (i === numberOfPathsToDraw && rem) {
          stopAngle = -2 * Math.PI * (fill / 100)
        }
        const circlePath = arc()
        .innerRadius(r1)
        .outerRadius(r2)
        .startAngle(startAngle)
        .endAngle(startAngle)

        const path = (
          <Path
            x={this.props.size / 2}
            y={this.props.size / 2}
            key={fill + i}
            d={circlePath()}
            fill={'blue'}
          />
        )
        startAngle = stopAngle
        stopAngle -= (2 * Math.PI)
        return path
      }),
      <Circle
        key={'end_circle2'}
        cx={(r2 - (r2 - r1) / 2) * Math.sin(2 * Math.PI * (fill / 100) - Math.PI) + size / 2}
        cy={(r2 - (r2 - r1) / 2) * Math.cos(2 * Math.PI * (fill / 100) - Math.PI) + size / 2}
        r={width / 2}
        fill={'white'}
      />,
      <Circle
        key={'end_circle3'}
        cx={((r2 - (r2 - r1) / 2) * Math.sin(2 * Math.PI * (fill / 100) - Math.PI) + size / 2)}
        cy={((r2 - (r2 - r1) / 2) * Math.cos(2 * Math.PI * (fill / 100) - Math.PI) + size / 2)}
        r={width / 4}
        fill={'#f24965'}
      />,
    ]
  }

  render () {
    const { size, rotation, style, children, isChoose } = this.props;
    const { linearGradients, renderLinearGradient } = this.state;
    const fill = this.extractFill()
    const fillAtChoose = this.extractFill2()
    return (
      <View style={style}>
        <Svg width={size} height={size} originX={size / 2}>
          <Defs key="linear_gradients">{linearGradients}</Defs>
          <Defs key="renderLinearGradient">{renderLinearGradient}</Defs>
          <G rotate={rotation - 90}>
            {this.renderBackgroundPath()}
            {isChoose && fillAtChoose > 0 && this.renderBackgroundPath2()}
            {isChoose && fillAtChoose > 0 && this.renderCirclePaths2()}
            {fill > 0 && this.renderCirclePaths()}
          </G>
        </Svg>
        {children(fill)}
      </View>
    )
  }
}

CircularProgress.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.func,
  fill: PropTypes.number.isRequired,
  rotation: PropTypes.number,
  size: PropTypes.number.isRequired,
  style: ViewPropTypes.style,
  tintColor: PropTypes.string,
  width: PropTypes.number.isRequired,
  linecap: PropTypes.string
}

CircularProgress.defaultProps = {
  tintColor: 'black',
  backgroundColor: '#e4e4e4',
  rotation: 90,
  linecap: 'butt'
}
