// import React from 'react'
// import { Form, Input } from 'antd'

// import './user-password.scss'

// const { Item } = Form

// const formItemLayout = {
//   labelCol: { xs: { span: 24 }, sm: { span: 4 } },
//   wrapperCol: { xs: { span: 24 }, sm: { span: 19 } }
// }


// const formWrapper = Form.create({
//   name: 'user_password'
// })
// class UserPassword extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       password: '',
//       password2: '',
//     }
//   }

//   onValueChange(key, value) {
//     this.setState({
//       [key]: value
//     })
//   }

//   render() {
//     return (
//       <div className='user-password-container'>
//         <Form {...formItemLayout} colon={false}
//           onSubmit={this.handleSubmit}
//         >
//           <Item label='密码' required>
//             <Input className='custom-antd'
//               onChange={(ev)=>this.onValueChange('password', ev.target.value)}
//             />
//           </Item>
//           <Item label='确认密码' required>
//             <Input className='custom-antd'
//               onChange={(ev)=>this.onValueChange('password2', ev.target.value)}
//             />
//           </Item>
//         </Form>
//       </div>
//     )
//   }
// }

// export default formWrapper(UserPassword)