import React,{ PureComponent } from "react";




export default class ChatTabsHeaders extends PureComponent {

    onTabClick = (id) => {
        if (id != this.props.active) { //исключаем холостые отработки функций
            this.props.setActive(id);
        }
    }

    render() {

        let headers = this.props.tabs.map(item=>(
            <span className={`tab__header-element ${item.id == this.props.active ? 'tab__header-element-active' : ''}`} key={item.id} onClick={()=>this.onTabClick(item.id)} >
                {item.name}
            </span>
        ));
        return <div className="interface__chat-header tab__header">
            {headers}
        </div>

    }
}