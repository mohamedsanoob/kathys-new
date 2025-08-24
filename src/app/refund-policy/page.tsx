import Link from "next/link";
import Head from "next/head";

const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>Refund Policy | Kathy&apos;s Clothing Store</title>
        <meta
          name="description"
          content="Comprehensive refund and exchange policy for Kathy's Clothing Store. Learn about our return process, eligibility criteria, and customer satisfaction guarantee."
        />
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Refund Policy
        </h1>
        <p className="text-gray-600 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <p className="mb-6 text-lg font-medium text-gray-700">
            At Kathy&apos;s Clothing Store, we are wholeheartedly committed to ensuring 
            your complete satisfaction with every purchase. We understand that, occasionally, 
            issues may arise, and we have implemented clear and comprehensive policies 
            to address them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Damaged or Defective Products
          </h2>
          <p className="mb-4">
            We are pleased to accept returns in the unfortunate event of receiving 
            damaged or defective products, or if, by chance, you happen to receive 
            an incorrect item. In such cases, we will promptly and gladly issue a 
            full refund.
          </p>
          <p className="mb-4">
            We kindly request that upon receiving your order, you take a moment to 
            inspect it carefully. Should you discover that the item is defective, 
            damaged, or that an incorrect item has been delivered, please contact us 
            without delay. This will enable us to conduct an immediate assessment of 
            the issue, ensuring we take the necessary steps to rectify it to your 
            utmost satisfaction.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Eligibility Criteria for Returns
          </h3>
          <p className="mb-2">
            To be eligible for a return and refund, please ensure the following 
            criteria are met:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>The product must be returned within 7 days from the date of delivery.</li>
            <li>The item is returned in its original packaging with product tags intact.</li>
            <li>The product should remain unstitched, unused, and unaltered in any way.</li>
            <li>
              To expedite the processing of your return, we do require a photograph 
              or videograph showcasing the damage.
            </li>
            <li>Additionally, please retain the receipt or proof of purchase.</li>
          </ul>
          <p className="mb-4">
            Furthermore, please share the Order ID & return courier tracking ID to 
            facilitate the refund process.
          </p>
          <p className="mb-4">
            Upon receiving and inspecting your return, we will promptly notify you 
            of the approval status for your refund. If your return is approved, the 
            refund will be processed through your original payment method via Razorpay. 
            Kindly note that the refund may take 3-7 business days to be credited 
            from the date of the return&apos;s delivery.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Exchange Policy
          </h2>
          <p className="mb-4">
            Our exchange policy is designed to be straightforward, operating on a 
            &quot;No Questions Asked&quot; basis. If your dissatisfaction with a product stems 
            from appearance, color, or size-related issues, you have the option to 
            select an alternative product from our collection.
          </p>
          <p className="mb-4">
            To ensure a seamless exchange process, we kindly request that you promptly 
            notify us of your exchange requirement as soon as you identify it. This 
            swift communication allows us to reserve the desired items for you, ensuring 
            their availability before they potentially become unavailable due to high demand.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Eligibility Criteria for Exchange
          </h3>
          <p className="mb-2">
            To be eligible for an exchange, please ensure the following criteria are met:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>The product must be returned within 7 days from the date of delivery.</li>
            <li>The item is returned in its original packaging with product tags intact.</li>
            <li>The product should remain unstitched, unused, and unaltered in any way.</li>
            <li>Additionally, please retain the receipt or proof of purchase.</li>
          </ul>
          <p className="mb-4">
            Furthermore, please share the Order ID & return courier tracking ID to 
            facilitate the exchange process.
          </p>
          <p className="mb-4">
            Upon receiving and inspecting your return, we will promptly notify you 
            of the approval status for your exchange. If your return is approved, 
            your exchange order will be swiftly dispatched.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Return Process
          </h2>
          <p className="mb-4">
            We kindly request that you obtain prior authorization before sending 
            items back to us. Unapproved returns cannot be accepted. Your cooperation 
            is greatly appreciated.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Initiating a Return
          </h3>
          <p className="mb-2">
            To commence the return process, please contact us through any of the 
            following channels:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Phone: +91 7736491677 / +91 9074912348</li>
            <li>WhatsApp: +91 7736491677</li>
            <li>Email: customercare@kathysonline.in</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Return Address
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Alappuzha Branch (Primary Return Center)</h4>
            <p>
              Kathy&apos;s Clothing Store<br />
              Kiran Complex, Vazhichery<br />
              Near Premier Supermarket<br />
              Alappuzha, Kerala<br />
              PIN: 688001
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Kochi Branch (Alternative Return Center)</h4>
            <p>
              Kathy&apos;s Clothing Store<br />
              Thirunilath Building<br />
              Geethanjali Junction<br />
              Vyttila - Palarivattom Bypass Stretch<br />
              Kochi, Kerala<br />
              PIN: 682019
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Processing Timeline
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Return Window:</strong> 7 days from the date of delivery
            </li>
            <li>
              <strong>Inspection Period:</strong> 2-3 business days after we receive 
              your returned item
            </li>
            <li>
              <strong>Refund Processing:</strong> 3-7 business days after approval 
              (credited to original payment method via Razorpay)
            </li>
            <li>
              <strong>Exchange Processing:</strong> 1-2 business days for dispatch 
              after approval
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Non-Returnable Items
          </h2>
          <p className="mb-2">
            The following items cannot be returned or exchanged:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Items that have been worn, washed, or altered</li>
            <li>Products with missing or damaged tags</li>
            <li>Customized or personalized items</li>
            <li>Intimate apparel and undergarments (for hygiene reasons)</li>
            <li>Items damaged due to misuse or normal wear and tear</li>
            <li>Products returned after the 7-day return window</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Shipping Costs
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Damaged/Defective Items:</strong> We cover all return shipping 
              costs and will provide a prepaid return label
            </li>
            <li>
              <strong>Size/Color/Style Exchanges:</strong> Customer is responsible 
              for return shipping costs. We cover the shipping cost for sending 
              the exchanged item
            </li>
            <li>
              <strong>Change of Mind Returns:</strong> Customer bears all shipping costs
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Quality Assurance
          </h2>
          <p className="mb-4">
            At Kathy&apos;s Clothing Store, we take pride in the quality of our products. 
            Each item undergoes careful inspection before dispatch. However, if you 
            receive an item that doesn&apos;t meet our quality standards, we will:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Accept the return without question</li>
            <li>Provide a full refund or exchange as per your preference</li>
            <li>Cover all associated shipping costs</li>
            <li>Investigate the quality issue to prevent future occurrences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Customer Support
          </h2>
          <p className="mb-4">
            Our customer support team is available to assist you with any questions 
            or concerns regarding returns and exchanges:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Business Hours:</strong> Monday to Saturday, 10:00 AM - 7:00 PM</li>
            <li><strong>Response Time:</strong> Within 24 hours for emails and WhatsApp messages</li>
            <li><strong>Languages Supported:</strong> English, Hindi, Malayalam</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Additional Information
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              All refunds will be processed in Indian Rupees (INR) through the 
              original payment method
            </li>
            <li>
              For credit card refunds, please allow 1-2 additional billing cycles 
              for the credit to appear on your statement
            </li>
            <li>
              We reserve the right to refuse returns that do not meet our eligibility criteria
            </li>
            <li>
              This policy is subject to change without notice. Please check this 
              page periodically for updates
            </li>
          </ul>
        </section>

        <section>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              Our Commitment to You
            </h3>
            <p className="text-blue-700">
              Your satisfaction remains our paramount concern, and we are unwaveringly 
              dedicated to ensuring a seamless and exceedingly satisfying shopping 
              experience. We stand behind the quality of our products and are committed 
              to resolving any issues promptly and fairly.
            </p>
          </div>

          <p className="text-center text-gray-600">
            For any questions about this Refund Policy, please contact us at{" "}
            <a
              href="mailto:customercare@kathysonline.in"
              className="text-blue-600 hover:underline"
            >
              customercare@kathysonline.in
            </a>{" "}
            or call us at +91 7736491677
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;