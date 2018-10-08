import React from 'react'

const Spock = ({className,handler}) => (
    <svg version="1.1"  className={className} onClick={handler ? ()=>handler("spock") : null} data-icon="spock" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 512 512" style={{enableBackground: "new 0 0 512 512"}} xmlSpace="preserve">

        <path d="M444.877,280.458l-7.542-7.542c-18.021-18.031-47.481-21.958-69.482-9.313l-46.981,26.854l9.792-215.083
			c0-18.031-14.667-32.708-32.71-32.708c-3.896,0-7.646,0.688-11.125,1.948l1.167-11.542C287.996,14.833,273.1,0,254.808,0
			c-16.917,0-31.105,12.688-32.897,28.958l-30.147,182.146c-0.396,2.479-4.688,2.229-5.146,0.667L151.012,65.74
			c-3.896-13.583-16.48-23.073-30.605-23.073c-9.771,0-18.855,4.396-24.938,12.063c-6.063,7.667-8.271,17.531-6.021,27.042
			l6.917,29.406c-3.938-0.323-7.896,0.208-11.667,1.479c-14.042,4.677-22.605,18.698-20.334,33.51l20.959,120.5
			c0,47.542,8.334,82.719,15.334,103.844c3.979,12.052,6,24.729,6,37.677c0,11.271-1.563,22.49-4.667,33.323l-16.251,56.896
			c-0.917,3.219-0.271,6.677,1.729,9.354c2.021,2.667,5.167,4.24,8.521,4.24h192.007c3.438,0,6.646-1.646,8.646-4.427
			c2.021-2.781,2.563-6.365,1.479-9.615c-0.104-0.281-9.021-27.823-0.583-65.292c10.709-8.688,48.189-39.167,61.648-51.458
			c22.251-20.323,83.211-83.115,85.795-85.781C449.044,291.25,449.002,284.583,444.877,280.458z M344.812,365.458
			c-14.958,13.667-63.042,52.521-63.521,52.917c-1.792,1.448-3.083,3.458-3.646,5.708c-7.083,28.344-5.375,52.313-3,66.583h-164.5
			l12.354-43.292c3.646-12.74,5.5-25.927,5.5-39.188c0-15.219-2.375-30.146-7.083-44.375c-6.5-19.646-14.25-52.448-14.396-98.958
			L85.437,142.729c-0.667-4.313,1.875-8.458,6.021-9.844c2.375-0.802,4.938-0.583,7.188,0.677c2.146,1.208,3.667,3.177,4.292,5.552
			L126,237.104c1.333,5.719,7.021,9.302,12.813,7.948c5.729-1.354,9.292-7.094,7.938-12.823l-23-97.792
			c-0.021-0.125-0.063-0.25-0.083-0.375l-13.458-57.177c-0.729-3.135,0-6.385,2-8.906c4.896-6.219,16.208-3.635,18.208,3.229
			l35.604,146.031c2.938,10.26,12.438,17.427,23.104,17.427c11.729,0,21.688-8.385,23.688-20.01l30.229-182.781
			c0.667-6.01,5.729-10.542,11.771-10.542c6.542,0,11.854,5.271,11.917,10.667l-10.812,106.698l-10.479,73.125
			c-0.833,5.833,3.229,11.24,9.042,12.073c5.646,0.813,11.229-3.198,12.083-9.052l10.396-72.771
			c0.063-0.333,0.125-0.677,0.146-1.021l9.5-66.438C287,68.667,291.979,64,297.958,64c6.271,0,11.375,5.104,11.396,10.885
			l-10.667,233.958c-0.188,3.885,1.771,7.563,5.083,9.594c3.333,2.031,7.479,2.083,10.854,0.156l63.813-36.469
			c13.875-7.969,32.458-5.479,43.813,5.875l0.104,0.104C405.104,305.781,362.104,349.646,344.812,365.458z"/>

    </svg>
)

export default Spock