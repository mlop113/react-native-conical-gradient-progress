import React from 'react'
import {PropTypes} from 'prop-types'
import {Animated, ViewPropTypes, Easing} from 'react-native'
import CircularProgress from './CircularProgress'

const AnimatedProgress = Animated.createAnimatedComponent(CircularProgress)

export default class AnimatedCircularProgress extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      fillAnimation: 0,
      fillAtChoose: 0,
      counter: 0
    }
    this.interval = null
  }

  componentDidMount () {
    this.animate(this.props.duration)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.fill !== this.props.fill) {
      this.animate()
    }

    if (prevProps.isChoose !== this.props.isChoose && this.props.isChoose) {
      this.setState({
        fillAtChoose: this.state.fillAnimation
      })
    }
    if (prevProps.isChoose !== this.props.isChoose && !this.props.isChoose) {
      this.setState({
        fillAnimation: 0
      })
    }
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  async inAnimate () {
   await clearInterval(this.interval)
    this.interval = setInterval(async () => {
      if (this.state.fillAtChoose < 0) {
       await clearInterval(this.interval)
        this.setState({
          fillAtChoose: 0
        }, async () => {
          let onPress = this.props.callback
          await typeof onPress === 'function' && onPress()
          this.animate(50)
        })
      }
      this.setState((prevState) => ({
          fillAtChoose: prevState.fillAtChoose - 1
        }
      ))
    }, 10)
  }

  async deAnimate () {
    await clearInterval(this.interval)
    this.setState({
      counter: 0,
      fillAnimation: 100
    }, () => {
      this.interval = setInterval(async () => {
        if (this.state.fillAnimation < 0) {
         await clearInterval(this.interval)
          this.setState({
            fillAnimation: 0
          })
        }
        this.setState((prevState) => ({fillAnimation: prevState.fillAnimation - 0.5}))
      }, 35)
    })
  }

  async animate (dur) {
    await clearInterval(this.interval)
    this.setState({fillAnimation: 0}, () => {
      this.interval = setInterval(async () => {
        if (this.state.fillAnimation >= 100) {
          await clearInterval(this.interval)
        }
        this.setState((prevState) => ({fillAnimation: prevState.fillAnimation + 1}))
      }, dur)
    })
  }

  render () {
    const {fill, prefill, ...other} = this.props
    return <AnimatedProgress {...other} fillAtChoose={this.state.fillAtChoose} fill={this.state.fillAnimation}/>
  }
}

AnimatedCircularProgress.propTypes = {
  style: ViewPropTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.number,
  prefill: PropTypes.number,
  width: PropTypes.number.isRequired,
  beginColor: PropTypes.string,
  endColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  duration: PropTypes.number,
  easing: PropTypes.func
};

AnimatedCircularProgress.defaultProps = {
  duration: 500,
  easing: Easing.out(Easing.linear),
  prefill: 0
};
