import { formatPrice } from '../lib/cart.js'

export default function Price({ product, className = '' }) {
  return (
    <p className={className}>
      {product.oldPrice && <span className="label mr-2 text-signal">Sale</span>}
      <span className={product.oldPrice ? 'text-signal' : ''}>{formatPrice(product.price)}</span>
      {product.oldPrice && (
        <s className="ml-2 text-muted">
          <span className="sr-only">statt </span>
          {formatPrice(product.oldPrice)}
        </s>
      )}
    </p>
  )
}
