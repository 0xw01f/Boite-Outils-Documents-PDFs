export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 931 915"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hexagon outline */}
      <path
        d="M146.07 637.133L149.798 270.085L469.395 90.0284L785.262 277.019L781.534 644.067L461.937 824.124L146.07 637.133Z"
        stroke="currentColor"
        strokeWidth="25"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path
        d="M169.149 624.121L172.426 282.865L469.278 115.622L762.853 289.635L759.576 630.892L462.723 798.135L169.149 624.121Z"
        stroke="currentColor"
        strokeWidth="28"
        strokeLinejoin="round"
      />
      {/* Left arrow */}
      <path
        d="M302.752 457.311L395.457 497.76L258.909 563.294L16 457.311H302.752Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M258.909 351.331L395.457 416.865L302.752 457.312L16 457.312L258.909 351.331Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Right arrow */}
      <path
        d="M451.457 457.313L451.46 457.312L628.441 457.312L535.736 416.863L672.283 351.33L915.192 457.313L451.457 457.313Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M672.283 563.294L535.735 497.759L628.441 457.312L915.192 457.312L672.283 563.294Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Bottom-right arrow */}
      <path
        d="M497.753 530.162L497.651 530.127L485.543 721.064L700.43 881.019L497.753 530.162Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M497.753 530.162L497.692 530.132L669.245 615.102L700.456 880.998L497.753 530.162Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Top-left arrow */}
      <path
        d="M433.703 384.73L433.806 384.765L445.913 193.828L231.027 33.8728L433.703 384.73Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M433.703 384.73L433.764 384.76L262.212 299.79L231 33.8938L433.703 384.73Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Bottom-left arrow */}
      <path
        d="M433.764 530.005L445.872 720.941L230.985 880.896L433.764 530.005Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M433.764 530.005L262.212 614.975L231 880.871L433.764 530.005Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Top-right arrow */}
      <path
        d="M497.753 383.857L497.651 383.892L485.543 192.955L700.43 33L497.753 383.857Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M497.753 383.857L497.692 383.887L669.245 298.917L700.456 33.021L497.753 383.857Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
