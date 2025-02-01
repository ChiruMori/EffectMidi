export default function loading(): JSX.Element {
  return (
    <div className="loading">
      <div className="loading__content">
        <div className="loading__content__icon">
          <svg
            version="1.1"
            id="L2"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 100 100"
            enableBackground="new 0 0 100 100"
            xmlSpace="preserve"
          >
            <circle fill="none" stroke="#000" strokeWidth="4" cx="50" cy="50" r="44" />
            <circle fill="#000" stroke="#fff" strokeWidth="3" cx="8" cy="54" r="6">
              <animateTransform
                attributeName="transform"
                dur="2s"
                type="rotate"
                from="0 50 48"
                to="360 50 52"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <div className="loading__content__text">Loading...</div>
      </div>
    </div>
  )
}
